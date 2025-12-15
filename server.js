/**
 * CRUD Operations: Full Create, Read, Update, Delete functionality for each resource
 * RESTful API: Proper HTTP methods, status codes, and endpoint structure
 * Error Handling: Meaningful error messages and appropriate status codes
 * Basic Middleware: Request parsing, logging, and error handling
 * Initial Tests: Basic unit tests for core functionality
 * Documentation: Clear README and API documentation
 * Version Control: Proper Git usage with meaningful commits
 */
const express = require('express');
const { db, User, Message, Attachment } = require('./database/setup');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const app = express();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

//Logging
app.use((req, res, next) => {
    let now = new Date(Date.now()).toISOString()
    console.log(`${now}: ${req.method} ${req.url}`);
    next()
})

//Validation
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages =
            errors.array().map(error => error.msg);

        return res.status(400).json({
            error: 'Validation failed',
            messages: errorMessages
        });
    }

    if (req.body.completed === undefined) {
        req.body.completed = false;
    }

    next();
};

function requiresTrusted(req, res, next) {
    if(req.user) {
        if(req.user.role === 'trusted' || req.user.role === 'admin') {
            next()
        }else {
            return res.status(403).json({ error: 'Insufficient Permissions' });
        }
    }else {
        return res.status(401).json({ error: 'Requires being logged in' });
    }

}

function requiresAdmin(req, res, next) {
    if(req.user) {
        if(req.user.role === 'admin') {
            next()
        }else {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
    }else {
        return res.status(401).json({ error: 'Requires being logged in' });
    }

}

function requireAuth(req, res, next) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Requires authorization' });
    }

    // Get the token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    try {
        // Verify and decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // User info is now available from the token
        req.user = {
            id: decoded.id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        } else {
            return res.status(401).json({ error: 'Token verification failed' });
        }
    }
}






//Login
const loginValidation = [
    body('email')
        .exists()
        .withMessage("Must specify an email"),
    body('password')
        .exists()
        .withMessage("Must specify a password")
];

app.post('/api/login', loginValidation,handleValidationErrors,async (req, res) => {

    try {

        const {email,password} = req.body;



        let user = await User.findOne({where:{email:email}})
        if(!user) {
            return res.status(400).send({error: 'No user with that email'})
        }
        let matches = await bcrypt.compare(password, user.password)
        if(!matches) {
            return res.status(400).send({error: 'Incorrect password'})
        }
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN
            }
        );
        return res.json({
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        })
    }
    catch(error) {
            return res.status(500).send({error:`Server Error: ${error}`})
    }
})

//Register
const registerValidation = [
    body('username')
        .exists()
        .withMessage("Must specify a username")
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters'),
    body('email')
        .exists()
        .withMessage("Must specify an email")
        .isEmail()
        .withMessage('Email must be a valid email'),
    body('password')
        .exists()
        .withMessage("Must specify a password")
        .isLength({ min: 10})
        .withMessage('Password must be at least 10 characters')
];
app.post('/api/register',registerValidation,handleValidationErrors, async (req, res) => {

    try {
        let user;
        let {username,email,password} = req.body;
        // User verification not shown
        user = await User.findOne({where:{email:email}})
        if(user) {
            return res.status(401).send({error:"Email already in use"})
        }
        user = await User.create({
            email: email,
            password: await bcrypt.hash(password, 10),
            name: username,
        })
        if(user) {
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.name,
                    email: user.email
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN
                }
            );

            return res.json({
                message: 'Registration successful',
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            }).status(201)}
        return res.status(500).send({error:"Error creating user"})
    }
    catch(error) {
        return res.status(500).send({error:"Server Error: "+error})
    }
})



//Create GET routes to retrieve all items and individual items by ID
app.get('/api/users',requireAuth,requiresAdmin, async (req, res) => {
    let users = await User.findAll()
    res.status(200).json(users)
});
app.get('/api/users/:id',requireAuth, async (req, res) => {
    let user = await User.findByPk(req.params.id);
    user
        ? res.status(200).json(user)
        : res.status(404).json({message:`Unknown ID: ${req.params.id}`})
});
app.get('/api/messages', requireAuth,requiresAdmin, async (req, res) => {
    let messages = await Message.findAll()
    res.status(200).json(messages)
});
app.get('/api/messages/all', requireAuth, async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        include: {
            model: Message,
            as: 'received_messages',
            include: [
                { model: User, as: 'from' },
                { model: Attachment, as: 'attachments' }
            ]
        }
    });

    res.status(200).json(user.received_messages)
});
app.get('/api/messages/:id',requireAuth, async (req, res) => {
    let message = await Message.findByPk(req.params.id);
    if(!message) {
        return res.status(404).json({message:`Unknown ID: ${req.params.id}`})
    }
    let user = req.user;
    if(user.role === "admin" || (user.id === message.userId)) {
        return res.status(200).json(message)
    }else {
        return res.status(403).json({error:"Unauthorized"})
    }

});
app.get('/api/attachments',requireAuth,requiresAdmin, async (req, res) => {
    let attachments = await Attachment.findAll()
    res.status(200).json(attachments)
});
app.get('/api/attachments/:id',requireAuth, async (req, res) => {
    let attachments = await Attachment.findByPk(req.params.id);
    let user = req.user
    if(!attachments) {
        return res.status(404).json({message:`Unknown ID: ${req.params.id}`})
    }

    return res.status(200).json(attachments)

});

const messageValidation = [
    body('subject')
        .exists()
        .withMessage("Must specify a subject"),
    body('body')
        .exists()
        .withMessage("Must specify a body"),
    body('recipients')
        .exists()
        .isArray()
        .withMessage("Must specify recipients as array"),


];

app.post('/api/messages',requireAuth,requiresTrusted,messageValidation,handleValidationErrors, async (req, res) => {
    let message = {
        subject: req.body.subject,
        body: req.body.body,
        userId: req.user.id
    }

    let createdMessage = await Message.create(message)

    const recipients = await User.findAll({
        where: { id: req.body.recipients }
    });

    if (recipients.length === 0) {
        return res.status(400).json({error:"Needs at least 1 recipient"})
    }

    await createdMessage.addRecipients(recipients);

    res.status(201).json(createdMessage)



});

const attachmentValidation = [
    body('alt')
        .exists()
        .withMessage("Must have alt text"),
    body('data')
        .exists()
        .withMessage("Must specify a body"),
    body('message')
        .exists()
        .withMessage("Must specify message to attach to")
        .isNumeric()
        .withMessage("ID is a number")

];

app.post('/api/attachments',requireAuth,requiresTrusted,attachmentValidation,handleValidationErrors, async (req, res) => {
    let attachment = {
        alt: req.body.alt,
        data: req.body.data,
        messageId: req.body.message,
        userId: req.user.id
    }
    let message = await Message.findByPk(req.body.message);
    if(!message) {
        return res.status(404).json({message:`Unknown Message: ${req.params.id}`})
    }
    if(message.userId !== req.user.id) {
        return res.status(403).json({message:`Unauthorized to add attachment to message`})
    }
    Attachment.create(attachment).then((result) => {
        res.status(201).json(result)
    }).catch(err => {
        res.status(500).send({message:err.message})
    })
});
//Build PUT routes to update existing resources

const userUpdateValidation = [
    body('name')
        .optional()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Email must be a valid email'),
    body('password')
        .optional()
        .isLength({ min: 10})
        .withMessage('Password must be at least 10 characters')
];
app.put('/api/users/:id',requireAuth,userUpdateValidation,handleValidationErrors, async (req, res) => {
    let user = await User.findByPk(req.params.id);

    if(!user) {
        return res.status(404).json({message:`Unknown ID: ${req.params.id}`})
    }
    if(req.user.role !== "admin" || user.id !== req.user.id) {
        return res.status(403).json({error:"Unauthorized"})
    }
    let updates = {
        username: req.body.name,
        email: req.user.email,
        password: req.user.password
    }

    user.update(updates).then((result)=> {
        res.status(200).json(result)
    }).catch(err => {
        res.status(500).json({error:err.message})
    })

});
app.put('/api/messages/:id',requireAuth,requiresTrusted,handleValidationErrors, async (req, res) => {
    let message = await Message.findByPk(req.params.id);
    let user = req.user
    if(!message) {
        return res.status(404).json({message:`Unknown ID: ${req.params.id}`})
    }
    if(user.role === "admin" || (user.id === message.userId)) {
        let updates = {
            subject: req.body.subject,
            data: req.body.body
        }
        message.update(updates).then((result)=> {
            res.status(200).json(result)
        }).catch(err => {
            res.status(400).json({error:err.message})
        })
    }else {
        return res.status(403).json({error:"Unauthorized"})
    }
});
app.put('/api/attachments/:id',requireAuth,requiresTrusted,handleValidationErrors, async (req, res) => {
    let attachment = await Attachment.findByPk(req.params.id);
    let user = req.user
    if(!attachment) {
        return res.status(404).json({message:`Unknown ID: ${req.params.id}`})
    }
    if(user.role === "admin" || (user.id === attachment.userId)) {
        let updates = {
            alt: req.body.alt,
            data: req.body.data,
        }
        attachment.update(updates).then((result)=> {
            res.status(200).json(result)
        }).catch(err => {
            res.status(400).json({error:err.message})
        })
    }else {
        return res.status(403).json({error:"Unauthorized"})
    }
});
//Add DELETE routes to remove resources
app.delete('/api/users/:id',requireAuth,requiresAdmin, async (req, res) => {
    let user = await User.findByPk(req.params.id);
    if(!user) {
        return res.status(404).json({message:`Unknown ID: ${req.params.id}`})
    }
    user.destroy().then(()=> {
        res.status(200).json({message:`Successfully deleted: ${req.params.id}`})
    }).catch(err => {
        res.status(500).json({error:err.message})
    })

});
app.delete('/api/messages/:id',requireAuth,requiresTrusted, async (req, res) => {
    let message = await Message.findByPk(req.params.id);
    let user = req.user
    if(!message) {
        return res.status(404).json({message:`Unknown ID: ${req.params.id}`})
    }
    if(user.role === "admin" || (user.id === message.userId)|| message.recipients.some(r => r.id === user.id)) {
        message.destroy().then(()=> {
            res.status(200).json({message:`Successfully deleted: ${req.params.id}`})
        }).catch(err => {
            res.status(500).json({error:err.message})
        })
    }else {
        return res.status(403).json({error:"Unauthorized"})
    }
});
app.delete('/api/attachments/:id',requireAuth,requiresTrusted, async (req, res) => {
    let attachments = await Attachment.findByPk(req.params.id);
    let user = req.user
    if(!attachments) {
        return res.status(404).json({message:`Unknown ID: ${req.params.id}`})
    }
    if(user.role === "admin" || (user.id === attachments.userId)) {
        attachments.destroy().then(()=> {
            res.status(200).json({message:`Successfully deleted: ${req.params.id}`})
        }).catch(err => {
            res.status(500).json({error:err.message})
        })
    }else {
        return res.status(403).json({error:"Unauthorized"})
    }
});

// Start server
// Only start server when running directly, not when testing
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`API server running at
    http://localhost:${PORT}`);
    });
}

module.exports = app;

