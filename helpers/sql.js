const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

// Can Update user data with `data`.
//  This is a "partial update" --- it's fine if data doesn't contain
//  all the fields; this only changes provided ones.
// Data can include:
//  { firstName, lastName, password, email, isAdmin }

// example:
// {newValue: 'Aliya'},
// {fieldToUpdate: 'firstName'}

// Can Update company data with `data`.
//  This is a "partial update" --- it's fine if data doesn't contain all the
//  fields; this only changes provided ones.
//  Data can include: {name, description, numEmployees, logoUrl}


function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
