from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/<str:name>", views.title, name="title"),
    path("edit/<str:name>", views.edit, name="edit"),
    path("RandomPage", views.Random, name="Random"),
    path("creat", views.creat, name="creat"),
    path("search", views.search, name="search")
]
