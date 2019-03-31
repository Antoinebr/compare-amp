deploy:
	rsync -arv  $(shell pwd)/dist/ \
	/Users/abrossault/Documents/code/Antoinebr.github.io.git/compareAMP/ --delete \
	&& bash /Users/abrossault/Documents/code/Antoinebr.github.io.git/deploy.sh
	