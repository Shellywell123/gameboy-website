# Gameboy project showcase website
| desktop  | mobile  |
|---|---|
|  <img src="https://github.com/alramalho/gameboy-website/assets/47791391/ed5d16c7-18f1-47eb-af5f-61f00317b44f" alt="Gameboy" style="display: block; margin-left: auto; margin-right: auto; width: 600px;"> | <img src="https://github.com/alramalho/gameboy-website/assets/47791391/0018d421-d341-4d0a-aaf9-5e7c256b9eb5" alt="Gameboy" style="display: block; margin-left: auto; margin-right: auto; width: 200px;">|
| Controls: keyboard | touch |

This is the source code powering https://alexramalho.dev. 
It displays a rotating cube with each face being a project of mine. 
Everyday, the websites are screenshot

### Tech stack
- Frontend: HTML, CSS, JS (w/ TS) & [Three JS](https://threejs.org/) for the 3D scene renderinig.
- Backend: AWS [lambda](https://aws.amazon.com/lambda/) + [event bridge](https://aws.amazon.com/eventbridge/) + s3
- Infrastructure as Code: [cdk](https://aws.amazon.com/cdk/)

### Running locally
```
cd frontend
yarn
yarn start
```
then visit `http://localhost:1234`

### Optional (backend for screenshots)
If you want to deploy it to your own AWS stack so that it screenshots your websites simply do
```
cd backend
yarn
yarn fast-deploy
```

and customize the env vars


### support
please consider [supporting](https://ko-fi.com/alexramalho) as a motivation booster to share more :) 


#### exiting note
did not fully check if all is 100%, if needed help lmk via [X](https://x.com/_alexramalho)
