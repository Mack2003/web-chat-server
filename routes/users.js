const express = require('express')
const userPath = express.Router()
const { schema2 } = require('../module/mainModule')
const path = require('path')
const { default: mongoose } = require('mongoose')
const multer = require('multer')
const fs = require('fs')


let userProfileModule = mongoose.model('user', schema2)

let SignedUPUserList = []

userProfileModule.find({}).then((documentData, err) => {
    if (err) {
        console.log(err)
    } else {
        SignedUPUserList = documentData.map((data) => {
            return {
                name: data.name.toLowerCase(),
                id: data._id,
                email: data.email,
                profileImage: data.profileImage,
            }
        })
    }
})



// Setting multer to store user profile pictures

fs.mkdirSync('./User_Profile_Images', { recursive: true })

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './User_Profile_Images');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });


userPath.get('/body', async (req, res) => {
    let user = await userProfileModule.findOne({ email: req.query.email })
    if (user) {
        if (req.query.password === user.password) {
            res.header(200).json({ status: true, data: user })
        } else {
            res.header(401).json({ status: false, data: 'Incorroct password or user name' })
        }
    } else {
        res.header(400).json({ status: false, data: 'No such user is available' })
    }
})


userPath.post('/body', async (req, res) => {
    let user = new userProfileModule({
        name: req.body.name,
        email: req.body.email,
        age: req.body.age,
        password: req.body.password,
        area: req.body.area,

    })
    user.save().then(data => {
        res.header(200).json({ status: true, data: data })
    }).catch(error => {
        res.header(500).json({ status: false, data: error })
    })
})


userPath.put('/searchfriend', async (req, res) => {
    let requestedUser = await userProfileModule.findById(req.body.frindOf).catch(err => console.log(err))
    requestedUser.friendList?.map(data => {
        if (data?.id === req.body.friend.id) {
            res.header(400).json({ status: false, data: 'This person is already in your friend list.' })
            return null;
        }
    })

    requestedUser.friendList.push(req.body.friend)
    requestedUser.save()

})

//Chacking available accounts matching with the user search input

userPath.get('/searchfriend/:name', async (req, res) => {
    let filteredDataAccordingInput = await SignedUPUserList.filter(data => {
        
        if (data.name.includes(req.params.name)) {
            return data
        }
    })
    if (filteredDataAccordingInput.length === 0) {
        filteredDataAccordingInput = [{
            name: 'No matching result found',
            id: 0,
            email: 'No matching result found'
        }]
    }
    filteredDataAccordingInput = filteredDataAccordingInput.slice(0, 10)
    res.header(200).json({ status: true, data: filteredDataAccordingInput })
})



//To handel profile image upload

userPath.post('/profileimage', upload.single('profile-image'), async (req, res) => {
    try {
    await userProfileModule.findByIdAndUpdate(req.body.id, { profileImage: `http://localhost:4000/users/profileimage/${req.file.filename}` })
        
    } catch (error) {
        console.log(error)
    }
    let deleteImageUser = await SignedUPUserList.find(data => {
        return data.id==req.body.id
    });

    deleteImageUser.profileImage = `http://localhost:4000/users/profileimage/${req.file.filename}`
    res.redirect('http://localhost:3000/user');

});


userPath.get('/profileimage/:imageName', async (req, res) => {
    console.log(req.params.imageName)
    let imageURL;
    try {
        imageURL =  await userProfileModule.findById(req.params.imageName)
        
    } catch (error) {
        console.log(error)
    }
    imageURL = imageURL.profileImage
    //Add logic if no user found
    imageURL = imageURL.split('/')
    imageURL = imageURL[imageURL.length-1]
    let image = path.join(__dirname, `../User_Profile_Images/${imageURL}`)
    res.sendFile(image);
})

userPath.delete('/profileimage/:id', async (req, res) => {
    let user;
    try {
        user =  await userProfileModule.findById(req.params.id)
    } catch (error) {
        console.log(error)
    }
    let filename = user.profileImage.split('/')
    filename = filename[filename.length-1]
    fs.unlink(path.join(__dirname, `../User_Profile_Images/${filename}`), err => err? console.log(err): '')
    user.profileImage= '';
    user.save()
    res.header(200).json({ status: true, data: 'Profile picture removed successfully' })
    return;
})

module.exports = userPath;