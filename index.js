const express = require("express");

const uniqid = require('uniqid');

const app = express();
app.use(express.json())



app.listen(8000);

let rooms = [];
let roomNo = 1;
let bookings =[];
let date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;

let time_regex = /^(0[0-9]|1\d|2[0-3])\:(00)/;

app.get("/",(req,res)=>{
    res.send("Homepage")
});

  app.get("/getAllRooms",(req,res)=>{
    res.send(rooms)
  });

app.get("/getAllBookings",(req,res)=>{
    res.send(bookings)
});

app.post("/createRoom",(req, res)=>{
    let room = {};
    room.id = uniqid();
    room.roomNo = roomNo;
    room.bookings = [];
   room.noofseats=req.body.noofseats
   room.amenities=req.body.amenities
   room.price=req.body.price
    rooms.push(room);
    roomNo++;
    res.status(200).send({msg: 'Room Created Successfully'}) 
});

app.post("/createBooking",(req, res)=>{
    let booking = {};
    booking.id = uniqid();
    if(req.body.custName){booking.custName = req.body.custName} else{res.status(400).send({msg: 'Please specify customer Name for booking.'})};
    if(req.body.date){
        if (date_regex.test(req.body.date)) {
            booking.date = req.body.date
        } else{
            res.status(400).send({msg: 'Please specify date in MM/DD/YYYY'})
        }
    } else{
        res.status(400).send({msg: 'Please specify date for booking.'})
    }

    if(req.body.startTime){
        if (time_regex.test(req.body.startTime)) {
            booking.startTime = req.body.startTime
        } else{
            res.status(400).send({msg: 'Please specify time in hh:min(24-hr format) where minutes should be 00 only'})
        }
    } else{
        res.status(400).send({msg: 'Please specify Starting time for booking.'})
    }

    if(req.body.endTime){
        if (time_regex.test(req.body.endTime)) {
            booking.endTime = req.body.endTime
        } else{
            res.status(400).send({msg: 'Please specify time in hh:min(24-hr format) where minutes should be 00 only'})
        }
    } else{
        res.status(400).send({msg: 'Please specify Ending time for booking.'})
    }

    const availableRooms = rooms.filter(room => {
        if(room.bookings.length == 0){
            return true;
        } else{
            room.bookings.filter(book =>{
                if((book.date == req.body.date) ){
                    if((parseInt((book.startTime).substring(0, 1)) > parseInt((req.body.startTime).substring(0, 1)) ) && 
                    (parseInt((book.startTime).substring(0, 1)) > parseInt((req.body.endTime).substring(0, 1)) ) ){ 
                        if((parseInt((book.startTime).substring(0, 1)) < parseInt((req.body.startTime).substring(0, 1)) ) && 
                          (parseInt((book.startTime).substring(0, 1)) < parseInt((req.body.endTime).substring(0, 1)) ) ){ 
                            return true;
                        }
                    }
                }
                else{
                    return true;
                }
            })

        }
    });
    if(availableRooms.length == 0){res.status(400).send({msg: 'No Available Rooms on Selected Date and Time'})}
   else{
    roomRec = availableRooms[0];
   let count =0;
   rooms.forEach(element => {
       if(element.roomNo == roomRec.roomNo){
        rooms[count].bookings.push({
            custName: req.body.custName,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            date: req.body.date
        })
       }
       count++;
   });
   let bookingRec = req.body;
   bookingRec.roomNo = roomRec.roomNo;
   bookingRec.price = parseInt(roomRec.price) * (parseInt((bookingRec.endTime).substring(0, 2)) - parseInt((bookingRec.startTime).substring(0, 2)));


   bookings.push(bookingRec);
   res.status(200).send({ msg:'Room Booked Successfully'}) 
}
});