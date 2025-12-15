const request = require('supertest');
const app = require('../server');
const {User, Message, Attachment} = require("../database/setup");
const {body} = require("express-validator"); // Import your Express app

let memberAuthToken = null;
let trustedAuthToken = null;
let adminAuthToken = null;


describe('Logging in', () => {
    const memberAuth = {
        email: "member@example.com",
        password: "password123"
    }
    const trustedAuth = {
        email: "trusted@example.com",
        password: "password123"
    }
    const adminAuth = {
        email: "admin@example.com",
        password: "password123"
    }

    test("Log into member ", async () => {
        let response = await request(app).post('/api/login').send(memberAuth)
        memberAuthToken = response.body.token
        expect(response.status).toBe(200);
    })

    test("Log into trusted ", async () => {
        let response = await request(app).post('/api/login').send(trustedAuth)
        trustedAuthToken = response.body.token
        expect(response.status).toBe(200);
    })

    test("Log into admin ", async () => {
        let response = await request(app).post('/api/login').send(adminAuth)
        adminAuthToken = response.body.token
        expect(response.status).toBe(200);
    })

});

let testUser = null;

describe('Registration', () => {
    let testUserCredentials = {
        username: "test",
        email: "testuser@example.com",
        password: "password123456"
    }
    test("POST /api/register", async () => {
        let response = await request(app)
            .post('/api/register')
            .send(testUserCredentials);
        expect(response.status).toBe(200)
        testUser = response.body.user;
    })
    test("POST /api/register", async () => {
        let response = await request(app)
            .post('/api/register')
            .send(testUserCredentials);
        expect(response.status).toBe(401)
    })
    test("POST /api/register", async () => {
        let response = await request(app)
            .post('/api/register')
            .send();
        expect(response.status).toBe(400)
    })
})


describe('GET /api/users',()=>{
    test("GET /api/users with admin perms ", async () => {
        let response = await request(app)
            .get('/api/users')
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/users with trusted perms ", async () => {
        let response = await request(app)
            .get('/api/users')
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("GET /api/users with member perms ", async () => {
        let response = await request(app)
            .get('/api/users')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("GET /api/users not logged in ", async () => {
        let response = await request(app)
            .get('/api/users')
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})
describe('GET /api/users/:id',()=> {
    test("GET /api/users/:id with admin perms ", async () => {
        let response = await request(app)
            .get('/api/users/1')
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/users/:id with trusted perms ", async () => {
        let response = await request(app)
            .get('/api/users/2')
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/users/:id with member perms ", async () => {
        let response = await request(app)
            .get('/api/users/1')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/users/:id not logged in ", async () => {
        let response = await request(app)
            .get('/api/users/1')
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

describe('GET /api/messages', ()=> {
    test("GET /api/messages with admin perms ", async () => {
        let response = await request(app)
            .get('/api/messages')
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/messages with trusted perms ", async () => {
        let response = await request(app)
            .get('/api/messages')
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("GET /api/messages with member perms ", async () => {
        let response = await request(app)
            .get('/api/messages')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("GET /api/messages not logged in ", async () => {
        let response = await request(app)
            .get('/api/messages')
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

describe('GET /api/messages/all', ()=> {
    test("GET /api/messages/all with admin perms ", async () => {
        let response = await request(app)
            .get('/api/messages/all')
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/messages/all with trusted perms ", async () => {
        let response = await request(app)
            .get('/api/messages/all')
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/messages/all with member perms ", async () => {
        let response = await request(app)
            .get('/api/messages/all')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/messages/all not logged in ", async () => {
        let response = await request(app)
            .get('/api/messages/all')
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

describe('GET /api/messages/:id',()=> {
    test("GET /api/messages/:id with admin perms ", async () => {
        let response = await request(app)
            .get('/api/messages/1')
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/messages/:id with trusted perms ", async () => {
        let response = await request(app)
            .get('/api/messages/3')
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/messages/:id with member perms ", async () => {
        let response = await request(app)
            .get('/api/messages/1')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/messages/:id not logged in ", async () => {
        let response = await request(app)
            .get('/api/messages/1')
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

describe('GET /api/attachments',()=> {
    test("GET /api/attachments with admin perms ", async () => {
        let response = await request(app)
            .get('/api/attachments')
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/attachments with trusted perms ", async () => {
        let response = await request(app)
            .get('/api/attachments')
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("GET /api/attachments with member perms ", async () => {
        let response = await request(app)
            .get('/api/attachments')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("GET /api/attachments not logged in ", async () => {
        let response = await request(app)
            .get('/api/attachments')
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

describe('GET /api/attachments/:id',()=> {
    test("GET /api/attachments/:id with admin perms ", async () => {
        let response = await request(app)
            .get('/api/attachments/1')
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/attachments/:id with trusted perms ", async () => {
        let response = await request(app)
            .get('/api/attachments/1')
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/attachments/:id with member perms ", async () => {
        let response = await request(app)
            .get('/api/attachments/1')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("GET /api/attachments/:id not logged in ", async () => {
        let response = await request(app)
            .get('/api/attachments/1')
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

let testMessages = []
let testMessageRequest = {
    subject: "Test",
    body: "Test"
}
describe('POST /api/messages (valid data)',()=> {
    testMessageRequest.recipients = [1,2]
    test("POST /api/messages with admin perms ", async () => {
        let response = await request(app)
            .post('/api/messages')
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .set("Content-Type", "application/json")
            .send(testMessageRequest);
        expect(response.status).toBe(201)
        testMessages.push(response.body)
    })
    testMessageRequest.recipients = [1,3]
    test("POST /api/messages with trusted perms ", async () => {
        let response = await request(app)
            .post('/api/messages')
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send(testMessageRequest);
        expect(response.status).toBe(201)
        testMessages.push(response.body)
    })
    test("POST /api/messages with member perms ", async () => {
        let response = await request(app)
            .post('/api/messages')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send(testMessageRequest);
        expect(response.status).toBe(403)
    })
    test("POST /api/messages not logged in ", async () => {
        let response = await request(app)
            .post('/api/messages')
            .send(testMessageRequest);
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

describe('POST /api/messages (invalid data)',()=> {
    test("POST /api/messages with admin perms ", async () => {
        let response = await request(app)
            .post('/api/messages')
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(400)

    })
    test("POST /api/messages with trusted perms ", async () => {
        let response = await request(app)
            .post('/api/messages')
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(400)

    })
    test("POST /api/messages with member perms ", async () => {
        let response = await request(app)
            .post('/api/messages')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("POST /api/messages not logged in ", async () => {
        let response = await request(app)
            .post('/api/messages')
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

let testAttachments = []
let testAttachmentRequest = {
    alt:"alt text",
    data: "test data"
}


describe('POST /api/attachments (Valid data)',()=> {
    test("POST /api/attachments with admin perms ", async () => {
        testAttachmentRequest.message = testMessages[0].id
        console.log(testMessageRequest)
        let response = await request(app)
            .post('/api/attachments')
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send(testAttachmentRequest);
        expect(response.status).toBe(201)
        testAttachments.push(response.body)

    })
    test("POST /api/attachments with trusted perms ", async () => {
        testAttachmentRequest.message = testMessages[1].id
        let response = await request(app)
            .post('/api/attachments')
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send(testAttachmentRequest);
        expect(response.status).toBe(201)
        testAttachments.push(response.body)
    })
    test("POST /api/attachments with member perms ", async () => {
        let response = await request(app)
            .post('/api/attachments')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({testAttachmentRequest});
        expect(response.status).toBe(403)
    })
    test("POST /api/attachments not logged in ", async () => {
        let response = await request(app)
            .post('/api/attachments')
            .send({testAttachmentRequest});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

describe('POST /api/attachments (Invalid data)',()=> {
    test("POST /api/attachments with admin perms ", async () => {
        let response = await request(app)
            .post('/api/attachments')
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(400)
    })
    test("POST /api/attachments with trusted perms ", async () => {
        let response = await request(app)
            .post('/api/attachments')
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(400)
    })
    test("POST /api/attachments with member perms ", async () => {
        let response = await request(app)
            .post('/api/attachments')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("POST /api/attachments not logged in ", async () => {
        let response = await request(app)
            .post('/api/attachments')
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

describe('PUT /api/users/:id',()=> {
    test("PUT /api/users/:id with admin perms ", async () => {
        let response = await request(app)
            .put(`/api/users/3`)
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("PUT /api/users/:id with trusted perms ", async () => {
        let response = await request(app)
            .put(`/api/users/1`)
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("PUT /api/users/:id with member perms ", async () => {
        let response = await request(app)
            .put(`/api/users/3`)
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("PUT /api/users/:id not logged in ", async () => {
        let response = await request(app)
            .put(`/api/users/3`)
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

describe('PUT /api/messages/:id',()=> {
    test("PUT /api/messages/:id with admin perms ", async () => {
        let response = await request(app)
            .put(`/api/messages/${testMessages[0].id}`)
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("PUT /api/messages/:id with trusted perms ", async () => {
        let response = await request(app)
            .put(`/api/messages/${testMessages[1].id}`)
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("PUT /api/messages/:id with member perms ", async () => {
        let response = await request(app)
            .put('/api/messages/1')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("PUT /api/messages/:id not logged in ", async () => {
        let response = await request(app)
            .put('/api/messages/1')
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

describe('PUT /api/attachments/:id',()=> {
    test("PUT /api/attachments/:id with admin perms ", async () => {
        let response = await request(app)
            .put(`/api/attachments/${testAttachments[0].id}`)
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("PUT /api/attachments/:id with trusted perms ", async () => {
        let response = await request(app)
            .put(`/api/attachments/${testAttachments[1].id}`)
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("PUT /api/attachments/:id with member perms ", async () => {
        let response = await request(app)
            .put('/api/attachments/1')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("PUT /api/attachments/:id not logged in ", async () => {
        let response = await request(app)
            .put('/api/attachments/1')
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

describe('DELETE /api/users/:id',()=> {
    test("DELETE /api/users/:id with admin perms ", async () => {
        let response = await request(app)
            .delete(`/api/users/${testUser.id}`)
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("DELETE /api/users/:id with trusted perms ", async () => {
        let response = await request(app)
            .delete('/api/users/1')
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("DELETE /api/users/:id with member perms ", async () => {
        let response = await request(app)
            .delete('/api/users/1')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("DELETE /api/users/:id not logged in ", async () => {
        let response = await request(app)
            .delete('/api/users/1')
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

describe('DELETE /api/messages/:id',()=> {
    test("DELETE /api/messages/:id with admin perms ", async () => {
        let response = await request(app)
            .delete(`/api/messages/${testMessages[0].id}`)
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("DELETE /api/messages/:id with trusted perms ", async () => {
        let response = await request(app)
            .delete(`/api/messages/${testMessages[1].id}`)
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("DELETE /api/messages/:id with member perms ", async () => {
        let response = await request(app)
            .delete('/api/messages/1')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("DELETE /api/messages/:id not logged in ", async () => {
        let response = await request(app)
            .delete('/api/messages/1')
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})

describe('DELETE /api/attachments/:id',()=> {
    test("DELETE /api/attachments/:id with admin perms ", async () => {
        let response = await request(app)
            .delete(`/api/messages/${testAttachments[0].id}`)
            .set("Authorization",`Bearer ${adminAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("DELETE /api/attachments/:id with trusted perms ", async () => {
        let response = await request(app)
            .delete(`/api/messages/${testAttachments[1].id}`)
            .set("Authorization",`Bearer ${trustedAuthToken}`)
            .send({});
        expect(response.status).toBe(200)
    })
    test("DELETE /api/attachments/:id with member perms ", async () => {
        let response = await request(app)
            .delete('/api/attachments/1')
            .set("Authorization",`Bearer ${memberAuthToken}`)
            .send({});
        expect(response.status).toBe(403)
    })
    test("DELETE /api/attachments/:id not logged in ", async () => {
        let response = await request(app)
            .delete('/api/attachments/1')
            .send({});
        //Should ALWAYS be 401
        expect(response.status).toBe(401)
    })
})
