# serializers.py

from rest_framework import serializers
from .models import Seat, Booking, HallSettings


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'user', 'seat', 'booking_date']
        read_only_fields = ['user']
