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
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});


/*
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const { db, User, Project, Task } = require('./database/setup');
require('dotenv').config();

const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());


// Role-based middleware functions
function requireAdmin(req, res, next) {
    // Check if user is authenticated first
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // Check
    if (req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            error: 'Access denied. Author role required.'
        });
    }
}

function requireManager(req, res, next) {
    // Check if user is authenticated first
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has editor role
    if (req.user.role === 'admin' || req.user.role === 'manager') {
        next();
    } else {
        return res.status(403).json({
            error: 'Access denied. Editor role required.'
        });
    }
}


function requireAuth(req, res, next) {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
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
            role: decoded.role
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

// Test database connection
async function testConnection() {
    try {
        await db.authenticate();
        console.log('Connection to database established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();

// AUTHENTICATION ROUTES

// POST /api/register - Register new user
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        });
        
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// POST /api/login - User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        try {

            // Create JWT token containing user data
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

            res.json({
                message: 'Login successful',
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            })}
        catch(error) {
                // Error handling not shwon
            }
        
        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// POST /api/logout - User logout
app.post('/api/logout', (req, res) => {
    //This doesnt do anything anymore :(
    req.status(200).json({message:"\"Logged out\""})
});

// USER ROUTES

// GET /api/users/profile - Get current user profile
app.get('/api/users/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email'] // Don't return password
        });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
});

// GET /api/users - Get all users (TODO: Admin only)
app.get('/api/users', requireAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name', 'email'] // Don't return passwords
        });
        
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// PROJECT ROUTES

// GET /api/projects - Get projects
app.get('/api/projects', requireAuth, async (req, res) => {
    try {
        const projects = await Project.findAll({
            include: [
                {
                    model: User,
                    as: 'manager',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });
        
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// GET /api/projects/:id - Get single project
app.get('/api/projects/:id', requireAuth, async (req, res) => {
    try {
        const project = await Project.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: 'manager',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Task,
                    include: [
                        {
                            model: User,
                            as: 'assignedUser',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                }
            ]
        });
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project' });
    }
});

// POST /api/projects - Create new project (TODO: Manager+ only)
app.post('/api/projects', requireManager, async (req, res) => {
    try {
        const { name, description, status = 'active' } = req.body;
        
        const newProject = await Project.create({
            name,
            description,
            status,
            managerId: req.user.id
        });
        
        res.status(201).json(newProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// PUT /api/projects/:id - Update project (TODO: Manager+ only)
app.put('/api/projects/:id', requireManager, async (req, res) => {
    try {
        const { name, description, status } = req.body;
        
        const [updatedRowsCount] = await Project.update(
            { name, description, status },
            { where: { id: req.params.id } }
        );
        
        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const updatedProject = await Project.findByPk(req.params.id);
        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Failed to update project' });
    }
});

// DELETE /api/projects/:id - Delete project (TODO: Admin only)
app.delete('/api/projects/:id', requireAdmin, async (req, res) => {
    try {
        const deletedRowsCount = await Project.destroy({
            where: { id: req.params.id }
        });
        
        if (deletedRowsCount === 0) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// TASK ROUTES

// GET /api/projects/:id/tasks - Get tasks for a project
app.get('/api/projects/:id/tasks', requireAuth, async (req, res) => {
    try {
        const tasks = await Task.findAll({
            where: { projectId: req.params.id },
            include: [
                {
                    model: User,
                    as: 'assignedUser',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });
        
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// POST /api/projects/:id/tasks - Create task (TODO: Manager+ only)
app.post('/api/projects/:id/tasks', requireManager, async (req, res) => {
    try {
        const { title, description, assignedUserId, priority = 'medium' } = req.body;
        
        const newTask = await Task.create({
            title,
            description,
            projectId: req.params.id,
            assignedUserId,
            priority,
            status: 'pending'
        });
        
        res.status(201).json(newTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', requireAuth, async (req, res) => {
    try {
        const { title, description, status, priority } = req.body;
        
        const [updatedRowsCount] = await Task.update(
            { title, description, status, priority },
            { where: { id: req.params.id } }
        );
        
        if (updatedRowsCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        const updatedTask = await Task.findByPk(req.params.id);
        res.json(updatedTask);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE /api/tasks/:id - Delete task (TODO: Manager+ only)
app.delete('/api/tasks/:id', requireManager, async (req, res) => {
    try {
        const deletedRowsCount = await Task.destroy({
            where: { id: req.params.id }
        });
        
        if (deletedRowsCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
*/