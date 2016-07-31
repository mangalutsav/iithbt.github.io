---
layout: page
title: Sample Articles
excerpt: "An archive of articles sorted by date."
search_omit: true
---

<ul class="post-list">
{% for post in site.posts limit:10 %}
  <li style="height:270px;"><article>
  <div class="post-thumb" float="left"><img {% if post.image.feature %}src="{{ site.url }}/images/{{ post.image.feature }}" {% else %}src="{{ site.url }}/images/site-logo.png"{% endif %} height="100%" width="100%" alt="{{ post.title }}"></div>
  <div class="post-content" float="right">
  <a href="{{ site.url }}{{ post.url }}">{{ post.title }}  <br><span class="entry-date"><time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %d, %Y" }}</time></span><br>{% if post.excerpt %} <span class="excerpt">{{ post.excerpt | remove: '\[ ... \]' | remove: '\( ... \)' | markdownify | strip_html | strip_newlines | escape_once }}</span>{% endif %}</a></div>
  </article></li>
{% endfor %}
</ul>
