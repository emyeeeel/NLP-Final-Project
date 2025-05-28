from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User 
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('name') or request.data.get('username') 
        password = request.data.get('password')
        email = request.data.get('email')

        if not username or not password or not email:
            return Response(
                {"detail": "Please provide username, email and password."},
                status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response(
                {"detail": "Username already exists."},
                status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email=email).exists():
            return Response(
                {"detail": "Email already exists."},
                status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username, 
            password=password, 
            email=email)
        
        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user":  {
                "username": user.username,
                "email": user.email,
                "isAdmin": user.is_staff,
            }
        }, status=status.HTTP_201_CREATED)
    
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get('identifier')
        password = request.data.get('password')

        if not identifier or not password:
            return Response(
                {"detail": "Please provide both identifier and password."},
                status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=identifier, password=password)

        if user is None:
            try:
                user_obj = User.objects.get(email=identifier)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist: 
                user = None

        if user is None:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "username": user.username,
                "email": user.email,
                "isAdmin": user.is_staff,
            }
        }, status=status.HTTP_200_OK)