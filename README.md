Cardinal Spline
===============

![Project status][status]

Assignment 1 of Computer Animation 2017 @ ZJU.  
Third-party Javascript libraries [JCanvas.js][jcanvasjs], and [jQuery-UI][jqueryui] are used in this project.

Open [Demo][demo] for playing!

Table of Contents
-----------------

  * [Requirements](#requirements)
  * [Usage](#usage)
  * [Structure](#structure)
  * [Direction](#direction)
  * [License](#license)
  * [Contact](#contact)

Requirements
------------

(Alternative) Cardinal Spline requires the following Python version and Python packages to run:

  * [Python][Python] 2.7
  * [Flask][Flask] 1.0.2

Usage
-----

You can directly open `spline.html` to enjoy yourself.

Alternatively, you can run the server on localhost by executing this script:
```cmd
$ RUN.bat
```

Then open [http://localhost:8080/][localhost] for fun!

Structure
-------------

```
Cardinal Spline
├─documents
├─spline.html       // Entrance of the app
├─static
│  ├─css
│  ├─icons
│  ├─images
│  ├─include
│  └─scripts
└─templates
```

Direction
--------

1. 主界面  
    ![][S0]  
    
    使用一个现代浏览器打开`spline.html`，浏览器将自动加载相关资源和脚本文件。最大化浏览器窗口以容纳所有视觉元素。

2. 操作指引  
    将页面滚动至底部，可以看到关于这个应用的操作指引。  
    
    ![][S1]  

    ![][S2]  

3. 绘制控制点  
    将页面滚动至顶部，用鼠标指针在画布空白处创建控制点。  
    
    ![][S3]  

4. 生成曲线  
    单击右下角的“绘制曲线”按钮，绘制Cardinal插值曲线。  

    ![][S4]  

5. 改变曲线弯曲程度的参数`τ∈[0，1]`大小，观察曲线形状的变化。  
    在左侧的设置面板中拖动滑动条来改变“张力值”，再次单击“绘制曲线”按钮。
    
    ![][S5]  

    ![][S6]  

6. 显示曲线点  
    打开“显示曲线点”开关。  
    
    ![][S7]  

7. 改变grain  
    改变“分段数”的值，再次单击“绘制曲线”按钮。“分段数”意味着每两个控制点间的曲线段数。  
    
    ![][S8]  

8. 插补动画中间帧  
    单击“统一插值”按钮进行曲线参数化处理。  
    
    ![][S9]  

9. 改变插补方式与补帧密度  
    改变补中间帧的方式并调整补帧密度，再次单击“统一插值”按钮。
    
    ![][S10]  

10. 播放动画  
    完成插值后，单击“开始运动”按钮播放逐帧动画。在此过程中可以依次单击“暂停”和“步进”按钮来逐帧观察火箭状态。  
    
    ![][S11]  
    
    ![][S12]  

License
-------

Cardinal Spline is licensed under the [MIT][MIT] license.  
Copyright &copy; 2017, [Yunzhe][yunzhe].

Contact
-------

For any question, please mail to [yunzhe@zju.edu.cn][Mail]



[status]: https://img.shields.io/badge/status-finished-green.svg "Project Status: Finished"
[demo]: https://yunzhezju.github.io/CardinalSpline/spline.html
[jcanvasjs]: https://projects.calebevans.me/jcanvas/
[jqueryui]: https://jqueryui.com/

[Python]: https://www.python.org/downloads/
[Flask]: https://github.com/pallets/flask

[localhost]: http://localhost:8080/

[S0]: docs/0.png
[S1]: docs/1.png
[S2]: docs/2.png
[S3]: docs/3.png
[S4]: docs/4.png
[S5]: docs/5.png
[S6]: docs/6.png
[S7]: docs/7.png
[S8]: docs/8.png
[S9]: docs/9.png
[S10]: docs/10.png
[S11]: docs/11.png
[S12]: docs/12.png

[MIT]: /LICENCE_MIT.md
[yunzhe]: https://github.com/YunzheZJU

[Mail]: mailto:yunzhe@zju.edu.cn