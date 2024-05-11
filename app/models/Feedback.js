const { Schema, models, model } = require("mongoose");
const User = require('./User');

const feedbackSchema = new Schema({
    title : {type:String, required:true},
    description : {type : String},
    uploads : {type : [String]},
    userEmail : {type:String, required:true},
    votesCountCached : {type : Number, default : 0}
},{
    timestamps:true,
    toObject : {virtuals : true},
    toJSON : {virtuals : true}
}
);


feedbackSchema.virtual('user', {
    ref : 'User',
    localField : 'userEmail',
    foreignField : 'email',
    justOne : true
})

export const FeedbackModel = models?.FeedbackModel || model('FeedbackModel', feedbackSchema);

