from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import CustomUserManager
import uuid

class User(AbstractUser):
    username = None # Remove username field
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    class Role(models.TextChoices):
        OWNER = 'OWNER', 'Owner'
        MANAGER = 'MANAGER', 'Manager'
        STAFF = 'STAFF', 'Staff'
        
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STAFF)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name'] # Removed username
    
    objects = CustomUserManager() # Use custom manager

    def __str__(self):
        return self.email
