const { sqlForPartialUpdate } = require("./sql");

describe("sqlForPartialUpdate", () => {
    test("partial update with first name", () => {    
      const sql = sqlForPartialUpdate(
        {newValue: 'Aliya'},
        {fieldToUpdate: 'firstName'}
      );      
      expect(sql).toEqual({ setCols: '"newValue"=$1', values: [ 'Aliya' ] });
    });
    
    test("partial update with first name and age", () => {    
        const sql = sqlForPartialUpdate(
          {newValue1: 'Aliya', newValue2: 32},
          {fieldToUpdate1: 'firstName', fieldToUpdate2: 'age'}
        );        
        expect(sql).toEqual({ setCols: '"newValue1"=$1, "newValue2"=$2', values: [ 'Aliya', 32 ] });
      });
  });
