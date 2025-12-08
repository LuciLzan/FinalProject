const request = require('supertest');
const app = require('../server'); // Import your Express app

test("GET all users", async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
})
test("GET all messages", async () => {
    const response = await request(app).get('/api/messages');
    expect(response.status).toBe(200);
})
test("GET all attachments", async () => {
    const response = await request(app).get('/api/attachments');
    expect(response.status).toBe(200);
})