"use strict";

const db = require("../db");
const { NotFoundError} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

// updating my code here to align with the provided solution
// pattern matched from models/company.js
/** Job Class and functions. 
 * 
*/

class Job {

/** Create a job.
    *  provide: { title, salary, equity, company_handle }
**/

static async create({ title, salary, equity, company_handle }) {
    const result = await db.query(
            `INSERT INTO jobs (title,
                                salary,
                                equity,
                                company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "company_handle"`,
        [
            title,
            salary,
            equity,
            company_handle,
        ]);
        const job = result.rows[0];

    return job;
    }

/** Find all jobs
     * can include optional filter criteria: minSalary, hasEquity, title
     * filter by title is case insensitive and will find partial matches
     * hasEquity: true, will ignore other criteria
 **/

    static async findAll({ minSalary, hasEquity, title } = {}) {
    let query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.company_handle AS "company_handle",
                        c.name AS "companyName"
                    FROM jobs j 
                    LEFT JOIN companies AS c ON c.handle = j.company_handle`;
    let whereAs = [];
    let filterBy = [];

/** Build the query string.
    * if any filter criteria are included, 
    *    add query parameters to the query string
**/

    if (minSalary) {
        filterBy.push(minSalary);
        whereAs.push(`salary >= $${filterBy.length}`);
    }

    if (hasEquity) {
        whereAs.push(`equity > 0`);
    }

    if (title) {
        filterBy.push(`%${title}%`);
        whereAs.push(`title ILIKE $${filterBy.length}`);
    }

    if (whereAs.length > 0) {
        query += " WHERE " + whereAs.join(" AND ");
    }

    const jobsRes = await db.query(query, filterBy);
    return jobsRes.rows;
    }

/** Get job information for a job id.
    * provide a job id
**/

   static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "company_handle"
           FROM jobs
           WHERE id = $1`, [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job found: ${id}`);

    const companiesRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM companies
           WHERE handle = $1`, [job.company_handle]);

    delete job.company_handle;
    job.company = companiesRes.rows[0];

    return job;
  }

/** Update job data. Can be a partial update.
   *  Can be a partial update.
*/

   static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity,
                                company_handle AS "company_handle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

/** Delete a job.
**/

   static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`, 
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job;  