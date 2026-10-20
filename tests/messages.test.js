const request = require('supertest');
const app = require('../src/app');

describe('Messages API Test Suite', () => {
  it('GET /api/messages/conversation/1 should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/messages/conversation/1');
    expect(res.statusCode).toEqual(401);
  });

  it('POST /api/messages should reject unauthenticated requests', async () => {
    const res = await request(app).post('/api/messages').send({
      conversationId: 1,
      content: 'Hello world'
    });
    expect(res.statusCode).toEqual(401);
  });
});
