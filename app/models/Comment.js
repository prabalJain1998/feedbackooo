const { Schema, models, model, default: mongoose } = require("mongoose");
const User = require('./User');

const commentSchema = new Schema({
    feedbackId : {type:mongoose.Types.ObjectId, required:true},
    comment : {type : String, required:true},
    uploads : {type : [String]},
    userEmail : {type : String, required:true},
},
 {
    timestamps:true,
    toObject : {virtuals : true},
    toJSON : {virtuals : true}
});


commentSchema.virtual('user', {
    ref : 'User',
    localField : 'userEmail',
    foreignField : 'email',
    justOne : true
})


export const CommentModel = models?.CommentModel || model('CommentModel', commentSchema);

