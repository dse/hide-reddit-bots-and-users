LOGOS = images/logo-32x32.png images/logo-16x16.png images/logo-19x19.png images/logo-48x48.png images/logo-128x128.png

RM = rm
INSTALL = install

default: logos google-chrome-resources

logos: $(LOGOS)

google-chrome-resources: images/logo-19x19.png
	install -d google-chrome/images
	$(INSTALL) images/logo-16x16.png   google-chrome/images
	$(INSTALL) images/logo-19x19.png   google-chrome/images
	$(INSTALL) images/logo-32x32.png   google-chrome/images
	$(INSTALL) images/logo-48x48.png   google-chrome/images
	$(INSTALL) images/logo-128x128.png google-chrome/images
	$(INSTALL) images/logo.svg         google-chrome/images

clean:
	$(RM) $(LOGOS)

%-32x32.png: %.svg
	convert -geometry 32x32 $< $@.tmp.png
	mv $@.tmp.png $@
%-48x48.png: %.svg
	convert -geometry 48x48 $< $@.tmp.png
	mv $@.tmp.png $@
%-128x128.png: %.svg
	convert -geometry 128x128 $< $@.tmp.png
	mv $@.tmp.png $@
%-16x16.png: %.svg
	convert -geometry 16x16 $< $@.tmp.png
	mv $@.tmp.png $@
%-19x19.png: %.svg
	convert -geometry 19x19 $< $@.tmp.png
	mv $@.tmp.png $@
