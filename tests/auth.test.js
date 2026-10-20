const request = require('supertest');
const app = require('../src/app');

describe('Auth Endpoints Test Suite', () => {
  it('GET /api/health should return status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('POST /api/auth/register should validate required fields', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /api/auth/login should fail with invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      usernameOrEmail: 'nonexistentuser',
      password: 'wrongpassword'
    });
    expect(res.statusCode).toEqual(401);
  });
});
