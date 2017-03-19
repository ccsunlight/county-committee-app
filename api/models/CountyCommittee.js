/**
 * CountyCommitteeMembers.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
 		petition_number: {
	      type: 'integer'
	    },
        office: {
	      type: 'string',
	      required: true
	    },
        office_holder: {
	      type: 'string',
	      required: true
	    },
        address: {
	      type: 'string'
	    },
        tally: {
	      type: 'integer'
	    },
        entry_type: {
	      type: 'string',
	      required: true
	    },
        ed_ad: {
	      type: 'string',
	      required: true
	    },
        electoral_district: {
	      type: 'integer',
	      required: true
	    },
        assembly_district: {
	      type: 'integer',
	      required: true
	    },
	    county: {
	      type: 'string',
	      required: true
	    },
	    state: {
	      type: 'string',
	      enum: ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'],
	      defaultsTo: 'NY'
	    },
        data_source: {
	      type: 'string',
	      required: true
	    }
  }
};

