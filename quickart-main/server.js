/* E4 server.js */
// 'use strict';

//NEED TO FIX THIS
const JWT = 'supersecrettoken';

// Express
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const cors = require('cors')
app.use(cors())
app.use(bodyParser.json());

//Bring middleware
const auth = require('./middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');

// Express validator
const { check, validationResult } = require('express-validator');

// Mongo and Mongoose
const { ObjectID } = require('mongodb')
const { mongoose } = require('./db/mongoose');
const Message = require('./models/message');
const Post = require('./models/post');
const Profile = require('./models/profile');
const User = require('./models/user');
const Report = require('./models/reports');

/// Route for getting all information.
// GET /restaurants
app.get('/', (req, res) => {
	res.send('API running')
})

//Check if mongo is working
// if (mongoose.connection.readyState != 1) {
// 	log('Issue with mongoose connection')
// 	res.status(500).send('Internal server error')
// 	return;
// }

////////////////////////////////////// AUTH ROUTES //////////////////////////////////////
// GET /auth - Get authenticated user (might delete, useful for getting user._id and verifying jwt)
app.get('/auth', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); //done via middleware/auth.js
		res.json(user);
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// POST /auth - Login a user
app.post('/auth', [
    check('email', 'Please include a valid email').exists(),
    check('password', 'Password is required').exists()
],async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //if there are errors
        return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body);
    const { email, password } = req.body; //delete later

    try {
        // See if user exists, send back an error
        let user = await User.findOne({ email });

        if (!user) {
            //if no 'return' errors out because res.send() line below, cant send multiple headers
            return res.status(400).json({ errors: [ { msg: 'User doesnt exist' }] });
        }

        // Match email and password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            //if no 'return' errors out because res.send() line below, cant send multiple headers
            return res.status(400).json({ errors: [ { msg: 'User doesnt exist' }] });
        }

        // Return json web token
        const payload = {
            user: {
                id: user.id,
                accType: user.accType
            }
        }
        jwt.sign(payload, JWT, { expiresIn: 360000 }, (error, token) => {
            if (error) {
                throw error;
            }
            //res.json({ token });
            res.json({ payload, token });
        });
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Sever error');
    }

});


////////////////////////////////////// MESSAGE ROUTES //////////////////////////////////////
// GET /messages - Get all messages between two users
app.get('/messages/:author_id/:recipient_id', auth, async (req, res) => {
    try {
        const id = req.params.author_id
        const resv_id = req.params.recipient_id
        // Good practise: Validate id immediately.
        if ((!ObjectID.isValid(id)) || (!ObjectID.isValid(resv_id))) {
            res.status(404).send()  // if invalid id, definitely can't find resource, 404.
            return;  // so that we don't run the rest of the handler.
        }
        // const messages = await Post.find().sort({ date: -1 });
        const messages = await Message.find({ author: id, recipient: resv_id }).sort({ date: -1 });
        // const posts = await Post.find().sort({ location: req.body.location });
        res.json(messages);
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// POST /messages - Create a message between two users
app.post('/messages/:author_id/:recipient_id', auth, async(req, res) => {
    const id = req.params.author_id
    const resv_id = req.params.recipient_id
    // Good practise: Validate id immediately.
    if ((!ObjectID.isValid(id)) || (!ObjectID.isValid(resv_id))) {
        res.status(404).send()  // if invalid id, definitely can't find resource, 404.
        return;  // so that we don't run the rest of the handler.
    }
    try {
        const newMessage = new Message({
            author: id, //req.user.id,
            recipient: resv_id, //req.user.id,
            text: req.body.text,
            dateSent: req.body.dateSent,
            liked: req.body.liked
        });

        const message = await newMessage.save();
        res.json(message);
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


////////////////////////////////////// POSTS ROUTES //////////////////////////////////////
// GET /posts - Get all posts
app.get('/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({ date: -1 });
        // const posts = await Post.find({ location: req.body.location }).sort({ date: -1 });
        res.json(posts);
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// GET /posts/:id - Get a post by id
app.get('/posts/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        // const posts = await Post.find().sort({ location: req.body.location });
        res.json(post);
    } catch(error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});

// DELETE /posts/:id - Delete a post by its id
app.delete('/posts/:id', auth, async (req, res) => {
    try {
        console.log(req.params.id)
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        await Report.deleteMany({ linkToPost: req.params.id });
    
        await post.remove();
        //Delete all reports
        await Report.deleteMany({ linkToPost: req.params.id });
        //Delete the post from owner's profile
        const postersProfile = await Profile.findOne({ "postings._id": mongoose.Types.ObjectId(req.params.id) });
        const keepPosts = await postersProfile.postings.filter(post => post._id != req.params.id);
        postersProfile.postings = keepPosts;
		await postersProfile.save()
        // await Profile.deleteOne({ linkToPost: req.params.id });
        res.json({ msg: 'Post removed' });
    } catch(error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});

// POST /posts - Create a post
app.post('/posts', 
    [
        auth,
        [
            check('title', 'Title is required').not().isEmpty()
        ]
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const user = await User.findById(req.user.id).select('-password');
            const profile = await Profile.findOne({ user: user._id });

            const newPost = new Post({
                postedBy: req.user.id,
                title: req.body.title,
                price: req.body.price,
                category: req.body.category,
                postEndDate: req.body.postEndDate,
                description: req.body.description,
                pickUpOptions: req.body.pickUpOptions,
                // likes: req.body.likes, //should always be [] initially
                // dislikes: req.body.dislikes, //should always be [] initially
                // pictures: req.body.pictures, //NEED TO BE FIXED SOMEHOW
                //Seller information, taken from User & Profile schema
                name: user.name,
                avatar: user.avatar,
                location: profile.location,
                biography: profile.biography,
                niche: profile.niche,
                tags: profile.tags,
			});

			const post = await newPost.save();
            // Append the post to the user's profile
            profile.postings.push(newPost);
			await profile.save();
            res.json(post);
        } catch(error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
});

// PUT /posts/like/id - Like a post
app.put('/posts/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
		}
		if (post.likes.filter(like => like.user == req.user.id).length > 0) {
			return res.status(400).json({ msg: 'Post already liked' });
		}
		post.likes.push({ user: req.user.id });
		//remove id from dislikes
		post.dislikes = post.dislikes.filter(dislike => dislike.user != req.user.id);
		res.json({ likes: post.likes })
		await post.save();
    } catch(error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});

// PUT /posts/dislike/id - Dislike a post
app.put('/posts/dislike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
		}
		if (post.dislikes.filter(dislike => dislike.user == req.user.id).length > 0) {
			return res.status(400).json({ msg: 'Post already disliked' });
		}
		post.dislikes.push({ user: req.user.id });
		//remove id from likes
		post.likes = post.likes.filter(like => like.user != req.user.id);
		res.json({ dislikes: post.dislikes })
		await post.save();
    } catch(error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.status(500).send('Server Error');
    }
});


////////////////////////////////////// PROFILES ROUTES //////////////////////////////////////
// GET /profile/me - get users profile
app.get('/profile/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
        
        if (!profile) {
            return res.status(400).json({ msg: 'There is no profile for this user' });
        }
        res.json(profile);
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

// POST /profile/me - create empty profile
app.post('/profile/me', auth, async (req, res) => {
    try {
        let profile = new Profile({
            tags: [],
            postings: [],
            user: req.user.id, //mongoose.Types.ObjectId(req.body.id),
            name: req.body.name,
            location: req.body.location,
            biography: "",
            niche: ""
		})
        await profile.save()
        res.json(profile);
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
    res.send();
});

// POST /profile - create or update user profile
// Can we delete check? I think front end has validation for this...
app.post('/profile', auth, async (req, res) => {
    const {
        name,
        // email,
        // password,
        location, 
        biography, 
        niche, 
        tags
    } = req.body;

    const profileFields = {}; 
    profileFields.user = req.user.id;
    if (name) {
        profileFields.name = name;
    }
    // if (email) {
    //     profileFields.email = email;
    // }
    // if (password) {
    //     // Encrypt password using bcrypt Create salt to hash
    //     const salt = await bcrypt.genSalt(10); //documentation recommendation
    //     profileFields.password = await bcrypt.hash(password, salt);
    //     //profileFields.password = password;
    // }
    if (location) {
        profileFields.location = location;
    }
    if (biography) {
        profileFields.biography = biography;
    }
    if (niche) {
        profileFields.niche = niche;
    }
    if (tags) {
        profileFields.tags = tags
    }

    try {
        let profile = await Profile.findOne({ user: req.user.id });
        //we found the profile
        if (profile) {
            profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields });//, { new: true });
            return res.json(profile);
        } 
        //if not, we need to create profile
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
    res.send();
})

// GET /profile - Get all profiles
app.get('/profile', auth, async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name','avatar']);
        res.json(profiles)
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})


// GET /profile/user/:user_id - Get profiles by user id
app.get('/profile/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name','avatar']);

        if (!profile) {
            return res.status(400).json({ msg: 'No profile found for this user' });
        }
        res.json(profile)
    } catch(err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({ msg: 'No profile found for this user' });
        }
        res.status(500).send('Server Error');
    }
})

// DELETE /profile - Delete profile and all attached data
app.delete('/profile', auth, async (req, res) => {
    try {
        //Remove user posts
		await Post.deleteMany({ postedBy: req.user.id });
        //Remove profile
        await Profile.findOneAndRemove({ user: req.user.id });
        //Remove user
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ msg: 'Account has been deleted' })
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});


////////////////////////////////////// USERS ROUTES //////////////////////////////////////
// POST /users - Register a user
app.post('/users', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
    //check('password', 'Please enter a password with 6 or more characaters').isLength({ min: 6})
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //if there are errors
        return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body);
    const { name, email, password } = req.body; //delete later

    try {
        // See if user exists, send back an error
        let user = await User.findOne({ email });

        if (user) {
            //if no 'return' errors out because res.send() line below, cant send multiple headers
            return res.status(400).json({ errors: [ { msg: 'User already exists' }] });
        }

        // Get the gravatr of user
        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })
        user = new User({
            name,
            email,
            avatar,
            password
		})
		
        // Encrypt password using bcrypt Create salt to hash
        const salt = await bcrypt.genSalt(10); //documentation recommendation
        user.password = await bcrypt.hash(password, salt);
        await user.save()

        
        // jwt.sign(user.id, JWT, { expiresIn: 360000 }, (err, token) => {
        //     if (err) {
        //         throw err;
        //     }
        //     res.json({ id: user.id, token });
        // }); 

        // Return json web token, I dont understand why we need this... expiresIn crashes if we dont
        // const payload = {
        //     id: user.id
        // }
        //......
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(payload, JWT, { expiresIn: 360000 }, (err, token) => {
            if (err) {
                throw err;
            }
            res.json({ payload, token });
        }); 
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Sever error');
    }
});

////////////////////////////////////// REPORT ROUTES //////////////////////////////////////
// POST /posts - Create a report for reportng a user
app.get('/reports', auth, async (req, res) => {
    try {
        const posts = await Report.find();
        // For now we dont include data since we dont have any to pass need to fix. 
        res.json(posts);
    } catch(error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

app.post('/reports', 
    async(req, res) => {
        try {

            let report = new Report({
                reportedBy: req.body.reportedBy,
                name: req.body.name,
                reportDescription: req.body.reportDescription,
                avatar: req.body.avatar,
                reason: req.body.reason,
                linkToPost: req.body.linkToPost,
            });
            console.log("report: ", report)
            await report.save();
            res.json(report);
        } catch(error) {
            console.error(error.message);
            res.status(500).send('Server Error');
        }
        res.send();
});


////////// DO NOT CHANGE THE CODE OR PORT NUMBER BELOW
const port = process.env.PORT || 5000
app.listen(port, () => {
	console.log(`Listening on port ${port}...`)
});