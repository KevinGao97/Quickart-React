const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
    reportedBy: { // uid of the guy who reports it 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    reportDescription: {
        type: String,
        // required: true
    },
    name: {
        type: String
    },
    reason: {
        type: String,
        // required: true
    },
    linkToPost: { // the actual post that got reported
        type: mongoose.Schema.Types.ObjectId,
    },
    report_date: {
        type: Date,
        default: Date.now
    }
})

const Report = mongoose.model('reports', ReportSchema);

module.exports = Report;
