const bcrypt = require('bcryptjs');
const { db, User, Message, Attachment } = require('./setup');



async function seedDatabase() {
    try {
        // Force sync to reset database
        await db.sync({ force: true });
        console.log('Database reset successfully.');

        // Create sample users
        const hashedPassword = await bcrypt.hash('password123', 10);

        //START AI (ChatGPT)
        // --- USERS ---
        const users = await User.bulkCreate([
            {
                name: "Alice",
                email: "alice@example.com",
                password: hashedPassword,
                role: "member"
            },
            {
                name: "Bob",
                email: "bob@example.com",
                password: hashedPassword,
                role: "trusted"
            },
            {
                name: "Charlie",
                email: "charlie@example.com",
                password: hashedPassword,
                role: "admin"
            }
        ]);


        // --- MESSAGES ---
        const msg1 = await Message.create({
            subject: "Welcome to the platform",
            body: "Excited to have you all here!",
            userId: users[0].id // Alice
        });

        const msg2 = await Message.create({
            subject: "Maintenance Notice",
            body: "Server will be down tonight at 1 AM.",
            userId: users[2].id // Charlie
        });


        // --- MESSAGE RECIPIENTS (M2M) ---
        await msg1.addRecipients([users[1].id, users[2].id]); // Bob + Charlie
        await msg2.addRecipients([users[0].id]);              // Alice


        // --- ATTACHMENTS (using real small base64 images) ---

        // 1×1 PNG (white)
        const base64_png_white =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+cqW8AAAAASUVORK5CYII=";

        // 1×1 JPG (black)
        const base64_jpg_black =
            "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAAQABADASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABQf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCfAAH/2Q==";

        await Attachment.bulkCreate([
            {
                alt: "welcome.png",
                data: base64_png_white,
                messageID: msg1.id,
                userId: users[0].id  // Alice uploaded
            },
            {
                alt: "maintenance.jpg",
                data: base64_jpg_black,
                messageID: msg2.id,
                userId: users[2].id  // Charlie uploaded
            }
        ]);
        //END AI

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await db.close();
    }
}

seedDatabase();