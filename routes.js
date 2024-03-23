"use strict";

/** Routes for Lunchly */

const express = require("express");

const { BadRequestError } = require("./expressError");
const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

const router = new express.Router();

/** Helper function to put fullName property on instances
 * Takes array Returns array
 */


/** Homepage: show list of customers. */

router.get("/",
  async function (req, res, next) {
    let customers;

    if (!req.query.search) {
      customers = await Customer.all();
      console.log(customers);

    } else {
      const name = req.query.search;

      customers = await Customer.search(name);
    }
    return res.render("customer_list.jinja", { customers });

  });


/**Show list of Top 10 customers ordered by num of reservations */

router.get("/top-ten", async function (req, res, next) {
  const customers = await Customer.getTopCustomers();

  const top_ten = true;

  return res.render("customer_list.jinja", { customers, top_ten });
});


/** Form to add a new customer. */

router.get("/add/", async function (req, res, next) {
  return res.render("customer_new_form.jinja");
});

/** Handle adding a new customer. */

router.post("/add/", async function (req, res, next) {
  if (req.body === undefined ||
    req.body.firstName === '' ||
    req.body.lastName === '') {

    throw new BadRequestError();
  }
  const { firstName, lastName, phone, notes } = req.body;
  const customer = new Customer({ firstName, lastName, phone, notes });
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Show a customer, given their ID. */

router.get("/:id/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);
  const reservations = await customer.getReservations();
  console.log("customer", customer);
  customer.fullName = await customer.getFullName();

  return res.render("customer_detail.jinja", { customer, reservations });
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function (req, res, next) {
  const customer = await Customer.get(req.params.id);
  customer.fullName = await customer.getFullName();
  res.render("customer_edit_form.jinja", { customer });
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function (req, res, next) {
  if (req.body === undefined) {
    throw new BadRequestError();
  }
  const customer = await Customer.get(req.params.id);
  customer.firstName = req.body.firstName;
  customer.lastName = req.body.lastName;
  customer.phone = req.body.phone;
  customer.notes = req.body.notes;
  await customer.save();

  return res.redirect(`/${customer.id}/`);
});

/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function (req, res, next) {
  if (req.body === undefined ||
    req.body.startAt === '' ||
    isNaN(new Date(req.body.startAt))) {
    throw new BadRequestError();
  }
  const customerId = req.params.id;
  const startAt = new Date(req.body.startAt);
  const numGuests = req.body.numGuests;
  const notes = req.body.notes;

  const reservation = new Reservation({
    customerId,
    startAt,
    numGuests,
    notes,
  });


  await reservation.save();

  return res.redirect(`/${customerId}/`);
});




module.exports = router;

