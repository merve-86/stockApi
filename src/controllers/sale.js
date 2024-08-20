"use strict";
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
// Sale Controllers:

const Sale = require("../models/sale");
const Product = require("../models/product");

module.exports = {
  list: async (req, res) => {
    /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "List Sales"
            #swagger.description = `
                You can use <u>filter[] & search[] & sort[] & page & limit</u> queries with endpoint.
                <ul> Examples:
                    <li>URL/?<b>filter[field1]=value1&filter[field2]=value2</b></li>
                    <li>URL/?<b>search[field1]=value1&search[field2]=value2</b></li>
                    <li>URL/?<b>sort[field1]=asc&sort[field2]=desc</b></li>
                    <li>URL/?<b>limit=10&page=1</b></li>
                </ul>
            `
        */

    const data = await res.getModelList(Sale, {}, [
      "userId",
      "brandId",
      "productId",
    ]);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Sale),
      data,
    });
  },

  create: async (req, res) => {
    /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Create Sale"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    $ref: "#/definitions/Sale"
                }
            }
        */

    // Set userId from logined user:
    req.body.userId = req.user._id;

    // Güncel stok bilgisini al:
    const currentProduct = await Product.findOne({ _id: req.body.productId });

    if (currentProduct.quantity >= req.body.quantity) {
      // Create:
      const data = await Sale.create(req.body);

      // Satıştan sonra product adetten eksilt:
      const updateProduct = await Product.updateOne(
        { _id: data.productId },
        { $inc: { quantity: -data.quantity } }
      );

      res.status(201).send({
        error: false,
        data,
      });
    } else {
      res.errorStatusCode = 422;
      throw new Error("There is not enough product-quantity for this sale.", {
        cause: { currentProduct },
      });
    }
  },

  read: async (req, res) => {
    /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Get Single Sale"
        */

    const data = await Sale.findOne({ _id: req.params.id }).populate([
      "userId",
      "brandId",
      "productId",
    ]);

    res.status(200).send({
      error: false,
      data,
    });
  },

  update: async (req, res) => {
    /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Update Sale"
            #swagger.parameters['body'] = {
                in: 'body',
                required: true,
                schema: {
                    $ref: "#/definitions/Sale"
                }
            }
        */
    if (req.body?.quantity) {
      // Mevcut işlemdeki adet bilgisi al:
      const currentSale = await Sale.findOne({ _id: req.params.id });
      // Farkı hesapla:
      const difference = req.body.quantity - currentSale.quantity;
      // Farkı Producta yansıt:
      const updateProduct = await Product.updateOne(
        { _id: currentSale.productId, quantity: { $gte: difference } },
        { $inc: { quantity: -difference } }
      );
      // Miktar yeterli değilse hataya yönlendir:
      if (updateProduct.modifiedCount == 0) {
        res.errorStatusCode = 422;
        throw new Error("There is not enough product-quantity for this sale.");
      }
      // productId değişmemeli:
      req.body.productId = currentSale.productId;
    }
    // Update:
    const data = await Sale.updateOne({ _id: req.params.id }, req.body, {
      runValidators: true,
    });

    res.status(202).send({
      error: false,
      data,
      new: await Sale.findOne({ _id: req.params.id }),
    });
  },

  delete: async (req, res) => {
    /*
            #swagger.tags = ["Sales"]
            #swagger.summary = "Delete Sale"
        */

    // Mevcut işlemdeki adet bilgisi al:
    const currentSale = await Sale.findOne({ _id: req.params.id });

    // Delete:
    const data = await Sale.deleteOne({ _id: req.params.id });

    // Product quantity'den adeti eksilt:
    const updateProduct = await Product.updateOne(
      { _id: currentSale.productId },
      { $inc: { quantity: +currentSale.quantity } }
    );

    res.status(data.deletedCount ? 204 : 404).send({
      error: !data.deletedCount,
      data,
    });
  },
};
