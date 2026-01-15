"""Tests for authentication endpoints."""
import pytest
from fastapi.testclient import TestClient
from backend.api.main import app
from backend.core.security import validate_password

client = TestClient(app)


class TestPasswordValidation:
    """Tests for password validation function."""

    def test_password_too_short(self):
        """Test that short passwords are rejected."""
        is_valid, msg = validate_password("Short1")
        assert not is_valid
        assert "8 characters" in msg

    def test_password_no_uppercase(self):
        """Test that passwords without uppercase are rejected."""
        is_valid, msg = validate_password("password123")
        assert not is_valid
        assert "uppercase" in msg

    def test_password_no_lowercase(self):
        """Test that passwords without lowercase are rejected."""
        is_valid, msg = validate_password("PASSWORD123")
        assert not is_valid
        assert "lowercase" in msg

    def test_password_no_number(self):
        """Test that passwords without numbers are rejected."""
        is_valid, msg = validate_password("PasswordABC")
        assert not is_valid
        assert "number" in msg

    def test_valid_password(self):
        """Test that strong passwords are accepted."""
        is_valid, msg = validate_password("StrongPass123")
        assert is_valid
        assert msg == ""


class TestRegistration:
    """Tests for user registration."""

    def test_register_weak_password(self):
        """Test that registration with weak password fails."""
        response = client.post("/api/auth/register", json={
            "email": "test@example.com",
            "password": "weak"
        })
        
        assert response.status_code == 400
        assert "Password must be" in response.json()["detail"]

    def test_register_invalid_email(self):
        """Test that registration with invalid email fails."""
        response = client.post("/api/auth/register", json={
            "email": "not-an-email",
            "password": "StrongPass123"
        })
        
        assert response.status_code == 422  # Pydantic validation error


class TestLogin:
    """Tests for user login."""

    def test_login_invalid_credentials(self):
        """Test that login with wrong credentials fails."""
        response = client.post("/api/auth/token", data={
            "username": "nonexistent@example.com",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
