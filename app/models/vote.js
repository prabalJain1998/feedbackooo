const { Schema, models, model, default: mongoose } = require("mongoose");

const voteSchema = new Schema({
    userEmail : {type:String, required:true},
    feedbackId : {type : mongoose.Types.ObjectId, required:true},
},{timestamps:true});

export const voteModel = models?.voteModel || model('voteModel', voteSchema);

