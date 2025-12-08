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
app.use((req, res, next) => {
    //Nothing needed for now, carry on
    next()
})


//Create GET routes to retrieve all items and individual items by ID
app.get('/api/users', async (req, res) => {
    let users = await User.findAll()
    res.status(200).json(users)
});
app.get('/api/users/:id', async (req, res) => {
    let user = await User.findByPk(req.params.id);
    user
        ? res.status(200).json(user)
        : res.status(404).json({message:`Unknown ID: ${req.params.id}`})
});
app.get('/api/messages', async (req, res) => {
    let messages = await Message.findAll()
    res.status(200).json(messages)
});
app.get('/api/messages/:id', async (req, res) => {
    let message = await Message.findByPk(req.params.id);
    message
        ? res.status(200).json(message)
        : res.status(404).json({message:`Unknown ID: ${req.params.id}`})
});
app.get('/api/attachments', async (req, res) => {
    let attachments = await Attachment.findAll()
    res.status(200).json(attachments)
});
app.get('/api/attachments/:id', async (req, res) => {
    let attachments = await Attachment.findByPk(req.params.id);
    attachments
        ? res.status(200).json(attachments)
        : res.status(404).json({message:`Unknown ID: ${req.params.id}`})
});
//Implement POST routes to create new resources with proper validation
app.post('/api/users', async (req, res) => {
    let user = req.body;
    user.id = undefined; //No ID manipulation
    user.password = bcrypt.hashSync(user.password, 10);
    User.create(user).then((result) => {
        res.status(201).json(result)
    }).catch(err => {
        res.status(400).send({message:err.message})
    })
});
app.post('/api/messages', async (req, res) => {
    let message = req.body;
    message.id = undefined; //No ID manipulation
    Message.create(message).then((result) => {
        res.status(201).json(result)
    }).catch(err => {
        res.status(400).send({message:err.message})
    })
});
app.post('/api/attachments', async (req, res) => {
    let attachment = req.body;
    attachment.id = undefined;
    Attachment.create(attachment).then((result) => {
        res.status(201).json(result)
    }).catch(err => {
        res.status(400).send({message:err.message})
    })
});
//Build PUT routes to update existing resources
app.put('/api/users/:id', async (req, res) => {
    let user = await User.findByPk(req.params.id);

    if(!user) {
        return res.status(404).json({message:`Unknown ID: ${req.params.id}`})
    }
    if(req.body.password) {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
    }
    user.update(req.body).then((result)=> {
        res.status(200).json(result)
    }).catch(err => {
        res.status(400).json({error:err.message})
    })

});
app.put('/api/messages/:id', async (req, res) => {
    let message = await Message.findByPk(req.params.id);
    if(!message) {
        return res.status(404).json({message:`Unknown ID: ${req.params.id}`})
    }
    message.update(req.body).then((result)=> {
        res.status(200).json(result)
    }).catch(err => {
        res.status(400).json({error:err.message})
    })
});
app.put('/api/attachments/:id', async (req, res) => {
    let attachment = await Attachment.findByPk(req.params.id);
    if(!attachment) {
        return res.status(404).json({message:`Unknown ID: ${req.params.id}`})
    }
    attachment.update(req.body).then((result)=> {
        res.status(200).json(result)
    }).catch(err => {
        res.status(400).json({error:err.message})
    })
});
//Add DELETE routes to remove resources
app.delete('/api/users/:id', async (req, res) => {
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
app.delete('/api/messages/:id', async (req, res) => {
    let message = await Message.findByPk(req.params.id);
    if(!message) {
        return res.status(404).json({message:`Unknown ID: ${req.params.id}`})
    }
    message.destroy().then(()=> {
        res.status(200).json({message:`Successfully deleted: ${req.params.id}`})
    }).catch(err => {
        res.status(500).json({error:err.message})
    })
});
app.delete('/api/attachments/:id', async (req, res) => {
    let attachments = await Attachment.findByPk(req.params.id);
    if(!attachments) {
        return res.status(404).json({message:`Unknown ID: ${req.params.id}`})
    }
    attachments.destroy().then(()=> {
        res.status(200).json({message:`Successfully deleted: ${req.params.id}`})
    }).catch(err => {
        res.status(500).json({error:err.message})
    })
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

