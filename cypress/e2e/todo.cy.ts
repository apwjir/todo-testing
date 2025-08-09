describe("Test todo list", () => {
  const baseUrl = "http://localhost:5173"; // or Cypress.env("FRONTEND_URL")

  beforeEach(() => {
    cy.visit(`${baseUrl}/login`);

    cy.intercept("POST", "/api/auth/login").as("loginRequest");

    cy.get("[data-cy='login-email']").type("testuser_wc0afb@example.com");
    cy.get("[data-cy='login-password']").type("Admin1234");
    cy.get("[data-cy='login-submit']").click();

    cy.wait("@loginRequest").its("response.statusCode").should("eq", 201);

    cy.url().should("eq", `${baseUrl}/`);
  });

  it("should add todo successfully", () => {
    cy.intercept("POST", "/api/todos").as("todoRequest");

    cy.get("[data-cy='title-input']").type("Test data");
    cy.get("[data-cy='note-input']").type("muhaha");
    cy.get("[data-cy='color-yellow']").click();
    cy.get("[data-cy='add-task']").click();

    cy.wait("@todoRequest").its("response.statusCode").should("eq", 201);

    cy.contains("Test data").should("exist");
    cy.contains("muhaha").should("exist");
  });

  it("should show error for blank title", () => {
    cy.get("[data-cy='add-task']").click();
    cy.contains("Title is required").should("exist");
  });

  it("should edit a todo", () => {
    cy.get("[data-cy^='todo-card-']")
      .first()
      .within(() => {
        cy.get("[data-cy='edit-task']").click();
        cy.get("[data-cy='edit-title-input']").clear().type("Edited title");
        cy.get("[data-cy='edit-note-input']").clear().type("Edited note");
        cy.get("[data-cy='save-task']").click();
      });
    cy.contains("Edited title").should("exist");
    cy.contains("Edited note").should("exist");
  });

  it("should cancel editing a todo", () => {
    cy.get("[data-cy^='todo-card-']")
      .first()
      .within(() => {
        cy.get("[data-cy='edit-task']").click();
        cy.get("[data-cy='edit-title-input']").clear().type("Should not save");
        cy.get("[data-cy='cancel-edit']").click();
      });
    cy.contains("Should not save").should("not.exist");
  });

  it("should delete a todo", () => {
    cy.intercept("DELETE", "/api/todos/*").as("deleteRequest");
    cy.get("[data-cy^='todo-card-']")
      .first()
      .within(() => {
        cy.get("[data-cy='delete-task']").click();
      });
    cy.wait("@deleteRequest").its("response.statusCode").should("eq", 200);
  });
});
