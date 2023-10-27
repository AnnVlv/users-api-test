const request = require('supertest')
const assert = require('assert')
require('dotenv').config()


const { apiToken } = process.env
const bearerApiToken = `Bearer ${apiToken}`

const apiUrl = 'https://gorest.co.in/public/v2'
const usersApiUrl = `${apiUrl}/users`


describe('users', () => {
    const createUserFields = ['name', 'email', 'gender', 'status']
    const userFields = ['id', ...createUserFields]

    let currentUserId = null
    
    it('should return a list of users', done => {
        const expectedPerPage = 2

        request(usersApiUrl)
            .get('/')
            .query({ per_page: expectedPerPage })
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                
                const users = res.body
                assert(users)
                assert(Array.isArray(users))
        
                assert.strictEqual(users.length, expectedPerPage)
        
                users.forEach((user) => {
                    userFields.forEach((field) => {
                        assert(user.hasOwnProperty(field))
                    })
                })
        
                currentUserId = users.length && users[0].id
                done()
            })
    })

    it('should get details of user', done => {
        const userId = currentUserId
        request(usersApiUrl)
            .get(`/${userId}`)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                
                const user = res.body
                assert(user)
                assert(user.id, userId)

                userFields.forEach((field) => {
                    assert(user.hasOwnProperty(field))
                })
        
                done()
            })
    })

    it('should create a user', done => {
        const payload = {
            email: Date.now() + 'email@email.com',
            name: 'Name',
            gender: 'male',
            status: 'active'
        }

        request(usersApiUrl)
            .post('/')
            .set('Authorization', bearerApiToken)
            .send(payload)
            .expect(201)
            .end((err, res) => {
                if (err) return done(err)

                const user = res.body
                assert(user)
                Object.keys(payload).forEach((field) => {
                    assert(user[field], payload[field])
                })
        
                done()
            })
    })

    it('should return validation errors if no data for creation user', done => {
        request(usersApiUrl)
            .post('/')
            .set('Authorization', bearerApiToken)
            .send({ })
            .expect(422)
            .end((err, res) => {
                if (err) return done(err)

                const validationErrors = res.body
                assert(Array.isArray(validationErrors))

                createUserFields.forEach(userField => {
                    assert(validationErrors.find(({ field }) => field === userField))
                })
        
                done()
            })
    })

    it('should update user', done => {
        const userId = currentUserId
        const payload = {
            name: 'newName',
            gender: 'female',
            email: Date.now() + 'email@email.com',
            status: 'inactive'
        }
        request(usersApiUrl)
            .put(`/${userId}`)
            .set('Authorization', bearerApiToken)
            .send(payload)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                
                const user = res.body
                assert(user)

                Object.keys(user).forEach(field => {
                    assert(user[field], payload[field])
                })

                done()
            })
    })

    it('should partially update user', done => {
        const userId = currentUserId
        const payload = {
            name: 'newName',
            gender: 'female'
        }
        request(usersApiUrl)
            .patch(`/${userId}`)
            .set('Authorization', bearerApiToken)
            .send(payload)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                
                const patchedUser = res.body
                assert(patchedUser)

                Object.keys(payload).forEach(field => {
                    assert(patchedUser[field], payload[field])
                })

                done()
            })
    })

    it('should delete user', done => {
        const userId = currentUserId
        request(usersApiUrl)
            .delete(`/${userId}`)
            .set('Authorization', bearerApiToken)
            .expect(204)
            .end((err, res) => {
                if (err) return done(err)

                done()
            })
    })

    it('should return not found status if user to delete not exists', done => {
        const userId = 'userId'
        request(usersApiUrl)
            .delete(`/${userId}`)
            .set('Authorization', bearerApiToken)
            .expect(404)
            .end((err, res) => {
                if (err) return done(err)

                done()
            })
    })
})
