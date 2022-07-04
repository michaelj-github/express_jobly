"use strict";

// updating my code here to align with the provided solution
// pattern matched from routes/companies.js
/** Jobs Routes. 
 * 
*/

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");
const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");

// this is in the solution but I am not sure why 'mergeParams: true' would be necessary
// const router = express.Router({ mergeParams: true });

const router = express.Router();

/** Create a job. Must be an admin.*/

router.post("/", ensureIsAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});


/** Find all jobs or find jobs by filter criteria, minSalary, hasEquity, title
    * filter by title is case insensitive and will find partial matches
    * hasEquity: true, will ignore other criteria
*/

router.get("/", async function (req, res, next) {
try {
    const jobs = await Job.findAll(req.query);
    return res.json({ jobs });
} catch (err) {
    return next(err);
}
});

/** FInd a job by job id */

router.get("/:id", async function (req, res, next) {
    try {
      const job = await Job.get(req.params.id);
      return res.json({ job });
    } catch (err) {
      return next(err);
    }
});
  
/** Update a job with a job id, must be an admin */

router.patch("/:id", ensureIsAdmin, async function (req, res, next) {
try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
    }
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
} catch (err) {
    return next(err);
}
});

/** Delete a job using a job id, must be an admin */
// return res.json({ deleted: +req.params.id });
// must have +req.params.id to compare

router.delete("/:id", ensureIsAdmin, async function (req, res, next) {
try {
    await Job.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
} catch (err) {
    return next(err);
}
});

module.exports = router;