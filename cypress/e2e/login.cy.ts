describe("Login Page", () => {
  let uniqueEmail: string;
  const password = "Admin1234";
  const baseUrl = "http://localhost:5173"; // or Cypress.env('FRONTEND_URL')

  before(() => {
    const randomString = Math.random().toString(36).substring(2, 8);
    uniqueEmail = `testuser_${randomString}@example.com`;
  });

  it("should register successfully and redirect to login", () => {
    cy.visit(`${baseUrl}/register`);
    cy.intercept("POST", "/api/auth/register").as("registerRequest");

    cy.get("[data-cy='register-name']").type("testuser");
    cy.get("[data-cy='register-email']").type(uniqueEmail);
    cy.get("[data-cy='register-password']").type(password);
    cy.get("[data-cy='register-submit']").click();

    cy.wait("@registerRequest").its("response.statusCode").should("eq", 201);
    cy.url({ timeout: 10000 }).should("include", "/login");
  });

  it("should show error for this email has been already use", () => {
    cy.visit(`${baseUrl}/register`);
    cy.intercept("POST", "/api/auth/register").as("registerRequest");

    cy.get("[data-cy='register-name']").type("testuser");
    cy.get("[data-cy='register-email']").type(uniqueEmail);
    cy.get("[data-cy='register-password']").type(password);
    cy.get("[data-cy='register-submit']").click();

    cy.contains("อีเมลนี้ถูกใช้แล้ว").should("exist");
  });

  it("should show error for invalid email form", () => {
    cy.visit(`${baseUrl}/register`);
    cy.intercept("POST", "/api/auth/register").as("registerRequest");

    cy.get("[data-cy='register-name']").type("testuser");
    cy.get("[data-cy='register-email']").type("UwU@HAAH");
    cy.get("[data-cy='register-password']").type(password);
    cy.get("[data-cy='register-submit']").click();

    cy.contains("อีเมลไม่ถูกต้อง").should("exist");
  });

  it("should login successfully with valid credentials", () => {
    cy.visit(`${baseUrl}/login`);
    cy.intercept("POST", "/api/auth/login").as("loginRequest");

    cy.get("[data-cy='login-email']").type(uniqueEmail);
    cy.get("[data-cy='login-password']").type(password);
    cy.get("[data-cy='login-submit']").click();

    cy.wait("@loginRequest").its("response.statusCode").should("eq", 201);
    cy.url().should("include", "/");
  });

  it("should show error for invalid credentials", () => {
    cy.visit(`${baseUrl}/login`);
    cy.intercept("POST", "/api/auth/login").as("loginRequest");

    cy.get("[data-cy='login-email']").type("wrong@example.com");
    cy.get("[data-cy='login-password']").type("wrongpass");
    cy.get("[data-cy='login-submit']").click();

    cy.wait("@loginRequest").its("response.statusCode").should("eq", 401);
    cy.contains("เข้าสู่ระบบไม่สำเร็จ").should("exist");
  });

  it("should validate empty form", () => {
    cy.visit(`${baseUrl}/login`);
    cy.get("[data-cy='login-submit']").click();

    cy.contains("กรุณากรอกอีเมล").should("exist");
    cy.contains("กรุณากรอกรหัสผ่าน").should("exist");
  });
});
