from django.shortcuts import render, redirect
from django.urls import reverse
from markdown2 import Markdown
import random
from . import util

# Function to check if the entry exists and return its content in Markdown format
def check(name):
    if util.get_entry(name) is None:
        content = "Requested page was not found."
        return content
    else:
        markdowner = Markdown()
        return markdowner.convert(util.get_entry(name))

# View to render the index page showing a list of all entries
def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })

# View to render an individual encyclopedia entry page
def title(request, name):
    return render(request, "encyclopedia/title.html", {
        "name": name,
        "content": check(name)
    })

# View to show a random encyclopedia entry
def Random(request):
    name = random.choice(util.list_entries())
    return redirect(reverse('title', args=[name]))

# View to handle search functionality
def search(request):
    q = request.GET.get('q', '')

    # If an exact match is found, redirect to the entry's page
    if q.lower() in [word.lower() for word in util.list_entries()]:
        return redirect(reverse('title', args=[q]))
    # If no exact match is found, show search results or "not found" message
    else:
        search_results = [entry for entry in util.list_entries() if q.lower() in entry.lower()]
        if search_results:
            return render(request, "encyclopedia/search.html", {
                "entries": search_results
            })
        else:
            return render(request, "encyclopedia/search.html", {
                "found": "not found"
            })

# View to handle entry creation
def creat(request):
    if request.method == "POST":
        title = request.POST.get('title')
        content = request.POST.get('content')

        # If the title is unique and both title and content are provided, save the entry and redirect to the entry's page
        if not title.lower() in [word.lower() for word in util.list_entries()]:
            if title and content:
                util.save_entry(title, content)
                return redirect(reverse('title', args=[title]))
            else:
                return render(request, "encyclopedia/creat.html", {
                    "error": "- Please Fill The Title and Content -"
                })
        else:
            return render(request, "encyclopedia/creat.html", {
                "error": "- An encyclopedia entry already exists with the provided title -"
            })

    return render(request, "encyclopedia/creat.html")

# View to handle entry editing
def edit(request, name):
    if request.method == "POST":
        content = request.POST.get('content')

        # If the content is provided, save the updated entry and redirect to the entry's page
        if content:
            util.save_entry(name, content)
            return redirect(reverse('title', args=[name]))
        else:
            return render(request, "encyclopedia/creat.html", {
                "error": "- Please Fill Content -"
            })

    return render(request, "encyclopedia/edit.html", {
        "name": name,
        "content": check(name)
    })
