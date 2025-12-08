/**
 * Database: At least 3 resource types with proper relationships and constraints
 *
 *
 */

const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Initialize database connection
const db = new Sequelize({
    dialect: process.env.DB_TYPE,
    storage: `database/${process.env.DB_NAME}` || 'database/messageapi.db',
    logging: false
});




// User Model
const User = db.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'member',
        validate: {
            isIn: [['member', 'trusted', 'admin']]
        }
    }
});

//Message Model
const Message = db.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
});

// Attachment Model
const Attachment = db.define('Attachment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    alt: {
        type: DataTypes.STRING,
        allowNull: false
    },
    //base64 image string
    data: {
        type: DataTypes.TEXT,
        allowNull: false
    },
});

// Define Relationships
User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'from' });

Message.belongsToMany(User, {
    through: 'MessageRecipients',
    as: 'recipients'
});
User.belongsToMany(Message, {
    through: 'MessageRecipients',
    as: 'received_messages'
});

Message.hasMany(Attachment, { foreignKey: 'messageID', as: 'attachments' });
Attachment.belongsTo(Message, { foreignKey: 'messageID', as: 'message' });

User.hasMany(Attachment, { foreignKey: 'userId', as: 'uploaded_attachments' });
Attachment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Initialize database
async function initializeDatabase() {
    try {
        await db.authenticate();
        console.log('Database connection established successfully.');
        
        await db.sync({ force: false });
        console.log('Database synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to database:', error);
    }
}

initializeDatabase();

module.exports = {
    db,
    User,
    Message,
    Attachment
};