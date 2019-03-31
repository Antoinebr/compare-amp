# Compare AMP 

Compare  AMP page to non AMP

## Demo : 

[Compare AMP demo](https://antoinebr.github.io/compareAMP/)

## How to use 

###  Install the dependencies 
 ```npm install```


### Use the project's scaffolding

The ```css``` should co in ```src/css```

The ```js``` should co in ```src/js```

The entry ```HTML``` file goes in ```src/index.html``` 

### run the dev env

```npm run dev``` ( will enable hot reloading )

### Build for production

```npm run build```

<hr>


#
## Aliases

```JavaScript 
alias: {
    '@css': path.resolve('./src/css/'),
    '@': path.resolve('./src/')
}
```


There's two aliases ```@``` and ```@css```

As an example I can use in my JavaScript to import my CSS 

```JavaScript 
import css from '@css/app.scss'
import yop from '@css/yop.css'
```

