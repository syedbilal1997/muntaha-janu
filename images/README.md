# images

The site uses `photo1.jpg`, `photo2.jpg`, `photo3.jpg` - compressed
web copies, about 170 KB each.

The full-size `photo*.png` originals sit alongside them and are
gitignored, so they stay on your machine without bloating the repo.

If you replace a photo, drop in the new original and regenerate the
jpg (1400px wide, quality 86). Photos are cropped to 4:3 and centred,
so keep faces near the middle.

To add a fourth, copy one `<figure class="slide">` block in `index.html`
and point it at `images/photo4.jpg`.
