LOGOS = images/logo-32x32.png images/logo-16x16.png

RM = rm

default: logos

logos: $(LOGOS)

clean:
	$(RM) $(LOGOS)

%-32x32.png: %.svg
	convert -geometry 32x32 $< $@.tmp.png
	mv $@.tmp.png $@
%-16x16.png: %.svg
	convert -geometry 16x16 $< $@.tmp.png
	mv $@.tmp.png $@
