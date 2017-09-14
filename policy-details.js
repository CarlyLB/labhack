// must set encoding to null to get Buffer as response type (otherwise get String)
var request = require('request-promise').defaults({ encoding: null });


function policy(scenario, custNum, firstName, policyNumber, Mobile,Email ) {
    this.scenario = scenario,
    this.custNum = custNum;
    this.firstName = firstName;
    this.policyNumber = policyNumber;
    this.Mobile = Mobile;
    this.Email = Email;
}
  
var policies = [
    // Customer with Home Policy - Laptop
    new policy('Laptop','22', 'Zack', 'MPA098233482',  '61430146757', 'tufg@mck.zyh'),
    // Customer with Home Policy - Building
    new policy('Building','9', 'Ollie', 'MPA098233482',  '61430907540', 'osihjpzg@kgafmtdzj.twe'),
    // Customer with Motor Policy 
    new policy('Car','61', 'Kyra', 'MPA098233482',  '61407810779', 'i@b.npd'),
];
 
 
/*
*
* Looks up scenario for the demo and brings up a specific policy record
* @param scenario
*/
var lookupPolicy = function(scenario) {
    var policy = policies.filter(p => {
        return p.scenario === scenario;
    })
    // Assume only one match
    return policy[0];
}


 
var exports = module.exports = {
    lookupPolicy: lookupPolicy,

}