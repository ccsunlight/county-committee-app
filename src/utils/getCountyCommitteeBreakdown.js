const CountyCommitteeModel = require("../services/county-committee/county-committee-model");
const CountyCommitteeMemberModel = require("../services/county-committee/county-committee-model");
const TermModel = require("../services/term/term-model");
const bb = require("bluebird");
const co = bb.coroutine;

module.exports = co(function*(county, party) {
  // Lean not working with "findOne" due to custom hooks
  // so need to use "find" instead.
  let countyCommitteeResult = yield CountyCommitteeModel.find(
    {
      county: county,
      party: party
    },
    "current_term_id _id"
  )
    .lean()
    .exec();
  const countyCommittee = countyCommitteeResult.pop();

  let currentTerm = yield TermModel.findOne({
    _id: countyCommittee.current_term_id
  })
    .lean()
    .exec();

  let numOfElected = yield CountyCommitteeMemberModel.find({
    term_id: countyCommittee.current_term_id,
    entry_type: {
      $in: ["Elected", "Uncontested"]
    }
  }).count();

  let numOfVacancies = yield CountyCommitteeMemberModel.find({
    office_holder: { $in: ["Vacancy", "None"] },
    term_id: countyCommittee.current_term_id
  }).count();

  let numOfAppointed = yield CountyCommitteeMemberModel.find({
    entry_type: "Appointed",
    term_id: countyCommittee.current_term_id
  }).count();

  return {
    county: county,
    party: party,
    term_start_date: currentTerm.start_date,
    term_end_date: currentTerm.end_date,
    numOfSeats: numOfElected + numOfVacancies + numOfAppointed,
    numOfElected: numOfElected,
    numOfVacancies: numOfVacancies,
    numOfAppointed: numOfAppointed
  };
});
