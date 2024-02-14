const express=require("express");
const chats=require('./Data/data');
const dotenv=require("dotenv");
const connectDB = require("./config/db");
const userRoutes=require('./UserRoutes/UserRoutes');
const chatRoutes=require('./UserRoutes/ChatsRoutes');
const messageRoutes=require('./UserRoutes/MessageRoutes');
const path=require('path');
const app=express();

app.use(express.json());
dotenv.config();
connectDB();

const PORT=process.env.PORT ||5000 ;




// app.get('/',(req,res)=>{
//     // res.redirect('/');
//     res.send("api is running main");
// });


app.use('/api/user',userRoutes);
app.use('/api/chat',chatRoutes);
app.use('/api/message',messageRoutes);



// app.use(express.static(path.join(__dirname,"./frontendnew/build")));


// app.get("*",(req,res)=>{
//         res.sendFile(path.join(__dirname,"./frontendnew/build/index.html")); 
//     });
//-----------------------------------------------------------------------------

const _dirname1=path.resolve()

if(process.env.NODE_ENV==='production'){
app.use(express.static(path.join(__dirname,"../frontendnew/build")));

app.get("*",(req,res)=>{
    res.sendFile(path.resolve(__dirname, "../frontendnew", "build", "index.html"))
});

}
else{
    app.get('/',(req,res)=>{
        res.send("api is running problem");
    });
    
}

//---------------------------------------------------------------------------------------------

const server=app.listen(PORT,console.log(`Server started at port ${PORT}`));

const io=require("socket.io")(server,{
    pingTimeout:60000,
    cors:{
        origin:"http://localhost:3000",
    },
});

io.on("connection",(socket)=>{
    console.log("connected to socket io");


// i had two option either send message using userid or room id i choose room id
//and i am using userid to send notification
    socket.on("setup",(userData)=>{
        console.log("userdata id"+userData._id);
        socket.join(userData._id);
        socket.emit("connected");
    });

//making changes..........................................................

    // socket.emit("connected");

    socket.on("join chat",(room)=>{
        socket.join(room);
        console.log("user joined "+room);

    });


    socket.on("typing",(room)=>socket.in(room).emit("typing")); 
    socket.on("stop typing",(room)=> socket.in(room).emit("stop typing"));




    socket.on("new message",(newMessageRecieved)=>{
       var chat=newMessageRecieved.chat;
       if(!chat.users){
        return console.log("chat.users not defined");
       }
        console.log(chat);

        socket.to(chat._id).emit("message recieved",(newMessageRecieved))





        chat.users.forEach((user) => {
            if(user._id == newMessageRecieved.sender._id)return;


            console.log("checkpointiuhgbudverfs4wzsvystrcta5cyvd")

            socket.in(user._id).emit("notification",(newMessageRecieved))
        });

        
    
        });

    socket.off("setup",()=>{
        console.log("User Disconnected");
        socket.leave(user._id);
    });
   
     
});


