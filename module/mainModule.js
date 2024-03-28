const mongoos= require('mongoose')
mongoos.connect('mongodb+srv://new-project:v2nGYhJSkb4M0YRv@new-project.jkkdcfq.mongodb.net/chat').then(console.log("Connected...")).catch(err=>console.log(err))

const schema2= new mongoos.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique: true
    },
    password:{
        type:String,
        require:true
    },
    age:{
        type:Number,
        require:true,
    },
    area:{
        type:String,
        require:true,
    },
    profileImage:{
        type:String,
        default:'',
    },
    friendList:{
        type:Array,
        default:[],
    },
    
},{timestamps:true})

const massage = new mongoos.Schema({
    massage: {
        type: String,
    },
    side: {
        type: String,
    },
}, {timestamps: true})



module.exports={schema2, massage}
