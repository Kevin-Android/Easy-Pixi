import { Renderer } from '@pixi/core';
import { Application } from '@pixi/app';
import { EventSystem } from '@pixi/events';
import { Graphics } from '@pixi/graphics';

// delete Renderer.__plugins.interaction;

const defaultOptions = {
    width: 800,
    height: 800,
    backgroundColor: 0xcccccc,
    backgroundAlpha: 1, // default: false 透明度
    antialias: true,    // default: false 反锯齿
    resolution: 1       // default: 1 分辨率 
}
const app = new Application();



let appDom;
let pixiApp;
let cursor = 0;
let stageBoundary = { top: 0, right: 0, bottom: 0, left: 0 };
let eventDiff;
let eventDragging;
let eventData;
let plugin = {
    init: init,
    getPixiApp: getPixiApp,
    addImage: addImage,
    addRect: addRect,
    setCursor: setCursor,
    end: () => { }
}


function init(dom, options = defaultOptions) {
    app.renderer.options = options;
    // app.init(options);
    dom.append(app.view)
    app.resizeTo = dom;
    stageBoundary.right = app.renderer.width;
    stageBoundary.bottom = app.renderer.height;
    console.log(app)
    window.onresize = () => {
        return (() => {
            app.resize()
            stageBoundary.right = app.renderer.width;
            stageBoundary.bottom = app.renderer.height;
        })()
    }
    // pixiApp.stage.on('pointermove', (e) => {
    //     console.log(e)
    // });

    // Install EventSystem, if not already
    //     (PixiJS 6 doesn't add it by default)
    // if (!('events' in app.renderer)) {
    //     // app.renderer.addSystem(EventSystem, 'events');
    // }

    // let circle = new Graphics();
    // circle.beginFill(0xffffff)
    //     .lineStyle({ color: 0x111111, alpha: 0.87, width: 1 })
    //     .drawCircle(0, 0, 8)
    //     .endFill()
    // // Create the circle
    // app.stage.addChild(circle);
    // circle.position.set(app.renderer.screen.width / 2, app.renderer.screen.height / 2);

    // // Enable interactivity!
    // app.stage.interactive = true;

    // // Make sure the whole canvas area is interactive, not just the circle.
    // app.stage.hitArea = app.renderer.screen;

    // // Follow the pointer
    // app.stage.addEventListener('pointermove', (e) => {
    //     circle.position.copyFrom(e.global);
    // });



}

// //绑定滚动事件
// function addMousewheelEvent(el, func) {
//     //统一处理滚轮滚动事件
//     function wheel(event) {
//         var ev = ev || event;
//         ev.preventDefault();
//         console.log(ev)
//         var delta = true;
//         if (ev.wheelDelta) {
//             delta = ev.wheelDelta > 0 ? true : false;
//         } else {
//             delta = ev.detail < 0 ? true : false;
//         }
//         func(delta);
//         return false;
//     }
//     if (window.addEventListener) {
//         el.addEventListener('mousewheel', wheel, false);
//         el.addEventListener('DOMMouseScroll', wheel, false); //FF,火狐浏览器会识别该方法
//     } else {
//         el.onmousewheel = wheel; //W3C
//     }
// }


function getPixiApp() {
    return pixiApp;
}


function addImage(url) {
    pixiApp.stage.removeChildren();
    let texture = new Texture.from(url);
    let image = new Sprite(texture);
    image.scale.set(1);
    image.x = 20;
    image.y = 0;
    pixiApp.stage.addChild(image);
    image.interactive = true;//响应交互
    image.buttonMode = true;//鼠标变手型
    // 给小鸟精灵添加事件
    image
        .on('pointerdown', onDragStart)
        .on('pointermove', onDragMove)
        .on('pointerup', onDragEnd)
        .on('pointerupoutside', onDragEnd)

    var imageScale = image.scale.x;

    image.on('pointerover', (ev) => {
        console.log(ev)
        // graphic.y -= ev.wheelDelta;
    });
    image.on('scroll', (ev) => {
        console.log(ev)
        // graphic.y -= ev.wheelDelta;
    });

    // 缓存一个全局鼠标位置以防止
    // 每个鼠标滚轮事件创建一个点
    // const mousePosition = new PIXI.Point();
    // pixiApp.view.addEventListener('mousewheel', (ev) => {
    //     mousePosition.set(ev.clientX, ev.clientY);

    //     // 直接在鼠标下返回元素
    //     const found = pixiApp.renderer.plugins.interaction.hitTest(
    //         mousePosition,
    //         pixiApp.stage
    //     );
    //     console.log(found)

    //     // Dispatch scroll event
    //     if (found) { found.emit('scroll', ev); }
    // });

    // addMousewheelEvent(appDom, (delta) => {
    //     console.log(pixiApp.stage.getBounds())
    //     if (delta == false) {//向下滚动
    //         imageScale > 0.5 && (imageScale -= 0.1)
    //     } else {//向上滚动
    //         imageScale < 3 && (imageScale += 0.1);
    //     }
    //     image.scale.set(imageScale);
    // })


}
//开始拖拽
function onDragStart(event) {
    eventDragging = true
    eventData = event.data
    // 鼠标点击位置和图形位置的偏移量，用于移动计算
    eventDiff = { x: event.data.global.x - this.x, y: event.data.global.y - this.y }

}

//拖拽移动中
function onDragMove() {
    if (eventDragging) {
        const newPosition = eventData.getLocalPosition(this.parent)
        // 不可超出布局边界
        // this.x = Math.min(Math.max(stageBoundary.left || 0, newPosition.x - eventDiff.x), stageBoundary.right - this.getBounds().width)
        // this.y = Math.min(Math.max(stageBoundary.top || 0, newPosition.y - eventDiff.y), stageBoundary.bottom - this.getBounds().height)
        this.x = newPosition.x - eventDiff.x;
        this.y = newPosition.y - eventDiff.y;

    }
}
//拖拽完成，松开鼠标或抬起手指
function onDragEnd() {
    if (eventDragging) {
        eventDragging = false
        eventData = null
    }
}


function addPoint(x, y, radius) {
    let point = new Graphics();
    pixiApp.stage.addChild(point)
    point.beginFill(0x66CCFF);
    point.drawCircle(x, y, radius);
    point.endFill();
}


function addRect() {
    let rect = new Graphics()
    // 矩形
    rect.beginFill(0xDE3249);
    rect.drawRect(50, 50, 100, 100);
    rect.endFill();
}


function cursorEvent(x, y) {
    switch (cursor) {
        case 0:
            break;
        case 1:
            addPoint(x, y, 2)
            break;
        default:
            break;

    }
}


function setCursor(tag) {
    cursor = tag;
}


export default plugin
