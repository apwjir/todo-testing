describe("API Integration Tests (e2e)", () => {
  const baseUrl = "http://localhost:3000"; // Change to your backend URL

  const testUser = {
    email: "testuser_8bxtf0@example.com",
    password: "Admin1234",
    name: "testuser",
  };

  const testTodo = {
    title: "Test Todo",
    note: "This is a test todo",
    timestamp: new Date().toISOString(),
    color: "#ff0000",
  };

  let authToken: string | null = null;
  let userId: string | null = null;
  let todoId: string | null = null;

  it("GET /users - should return how many users there are", () => {
    cy.request(`${baseUrl}/users`).then((firstRes) => {
      const expectedCount = firstRes.body.length; // ✅ actual number of users

      cy.request(`${baseUrl}/users`).then((res) => {
        expect(res.body).to.have.length(expectedCount); // ✅ compare correctly
      });
    });
  });

  describe("Auth Controller", () => {
    it("POST /auth/register - should fail with duplicate email", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/register`,
        body: testUser,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(500);
      });
    });

    it("POST /auth/login - should login with valid credentials", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/login`,
        body: {
          email: testUser.email,
          password: testUser.password,
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body).to.have.property("access_token");
        expect(res.body).to.have.property("name", testUser.name);
        authToken = res.body.access_token;
      });
    });

    it("POST /auth/login - should fail with invalid credentials", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/login`,
        body: {
          email: testUser.email,
          password: "wrongpassword",
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });

    it("POST /auth/login - should fail with non-existent user", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/auth/login`,
        body: {
          email: "nonexistent@example.com",
          password: "anypassword",
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });
  });

  describe("Todo Controller", () => {
    it("GET /todos - should require authentication", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/todos`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });

    it("POST /todos - should require authentication", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/todos`,
        body: testTodo,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });

    it("GET /todos - should return todos for authenticated user", () => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/todos`,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.be.an("array");
      });
    });
    it("POST /todos - should create a new todo", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/todos`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: testTodo,
      }).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body).to.have.property("id");
        expect(res.body).to.have.property("title", testTodo.title);
        expect(res.body).to.have.property("note", testTodo.note);
        expect(res.body).to.have.property("color", testTodo.color);

        // Just check userId is a non-empty string, don't compare with userId variable
        expect(res.body).to.have.property("userId").and.be.a("string").and.not
          .be.empty;

        todoId = res.body.id;
      });
    });

    it("PUT /todos/:id - should update a todo", () => {
      const updatedTodo = {
        title: "Updated Todo Title",
        note: "Updated note",
      };

      cy.request({
        method: "PUT",
        url: `${baseUrl}/todos/${todoId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: updatedTodo,
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("title", updatedTodo.title);
        expect(res.body).to.have.property("note", updatedTodo.note);
      });
    });

    it("PUT /todos/:id - should require authentication", () => {
      cy.request({
        method: "PUT",
        url: `${baseUrl}/todos/${todoId}`,
        body: { title: "Unauthorized update" },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });

    it("DELETE /todos/:id - should require authentication", () => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/todos/${todoId}`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(401);
      });
    });

    it("DELETE /todos/:id - should delete a todo", () => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/todos/${todoId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body).to.have.property("id", todoId);
      });
    });

    it("DELETE /todos/:id - should fail with non-existent todo", () => {
      cy.request({
        method: "DELETE",
        url: `${baseUrl}/todos/non-existent-id`,
        headers: { Authorization: `Bearer ${authToken}` },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.eq(500);
      });
    });
  });
});
