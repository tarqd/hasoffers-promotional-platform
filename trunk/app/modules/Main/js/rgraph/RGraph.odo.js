    /**
    * o------------------------------------------------------------------------------o
    * | This file is part of the RGraph package - you can learn more at:             |
    * |                                                                              |
    * |                          http://www.rgraph.net                               |
    * |                                                                              |
    * | This package is licensed under the RGraph license. For all kinds of business |
    * | purposes there is a small one-time licensing fee to pay and for non          |
    * | commercial  purposes it is free to use. You can read the full license here:  |
    * |                                                                              |
    * |                      http://www.rgraph.net/LICENSE.txt                       |
    * o------------------------------------------------------------------------------o
    */
    
    if (typeof(RGraph) == 'undefined') RGraph = {};

    /**
    * The odometer constructor. Pass it the ID of the canvas tag, the start value of the odo,
    * the end value, and the value that the pointer should point to.
    * 
    * @param string id    The ID of the canvas tag
    * @param int    start The start value of the Odo
    * @param int    end   The end value of the odo
    * @param int    value The indicated value (what the needle points to)
    */
    RGraph.Odometer = function (id, start, end, value)
    {
        this.id      = id
        this.canvas  = document.getElementById(id);
        this.context = this.canvas.getContext('2d');
        this.canvas.__object__ = this;
        this.type              = 'odo';


        /**
        * Compatibility with older browsers
        */
        RGraph.OldBrowserCompat(this.context);


        this.properties = {
            'chart.start':                  start,
            'chart.end':                    end,
            'chart.value':                  value,
            'chart.value.text':             false,
            'chart.needle.style':           'black',
            'chart.needle.thickness':       2,
            'chart.needle.head':            true,
            'chart.needle.tail':            true,
            'chart.needle.type':            'pointer',
            'chart.text.size':              10,
            'chart.text.color':             'black',
            'chart.text.font':              'Verdana',
            'chart.green.max':              end * 0.75,
            'chart.red.min':                end * 0.9,
            'chart.label.area':             35,
            'chart.gutter':                 25,
            'chart.title':                  '',
            'chart.title.vpos':             null,
            'chart.contextmenu':            null,
            'chart.linewidth':              1,
            'chart.shadow.inner':           false,
            'chart.shadow.outer':           false,
            'chart.annotatable':            false,
            'chart.annotate.color':         'black',
            'chart.zoom.factor':            1.5,
            'chart.zoom.fade.in':           true,
            'chart.zoom.fade.out':          true,
            'chart.zoom.hdir':              'right',
            'chart.zoom.vdir':              'down',
            'chart.zoom.frames':            10,
            'chart.zoom.delay':             50,
            'chart.zoom.shadow':            true,
            'chart.zoom.mode':              'canvas',
            'chart.zoom.thumbnail.width':   75,
            'chart.zoom.thumbnail.height':  75,
            'chart.zoom.background':        true,
            'chart.zoom.action':            'zoom',
            'chart.resizable':              false,
            'chart.units.pre':              '',
            'chart.units.post':             '',
            'chart.border':                 false,
            'chart.tickmarks.highlighted':  false
        }

        // Check the common library has been included
        if (typeof(RGraph) == 'undefined') {
            alert('[ODO] Fatal error: The common library does not appear to have been included');
        }
    }


    /**
    * A peudo setter
    * 
    * @param name  string The name of the property to set
    * @param value mixed  The value of the property
    */
    RGraph.Odometer.prototype.Set = function (name, value)
    {
        this.properties[name.toLowerCase()] = value;
    }


    /**
    * A getter
    * 
    * @param name  string The name of the property to get
    */
    RGraph.Odometer.prototype.Get = function (name)
    {
        return this.properties[name.toLowerCase()];
    }


    /**
    * Draws the odometer
    */
    RGraph.Odometer.prototype.Draw = function ()
    {
        // Work out a few things
        this.radius   = Math.min(this.canvas.width / 2, this.canvas.height / 2) - this.Get('chart.gutter') - (this.Get('chart.border') ? 15 : 0);
        this.diameter = 2 * this.radius;
        this.centerx  = this.canvas.width / 2;
        this.centery  = this.canvas.height / 2;
        this.range    = this.Get('chart.end') - this.Get('chart.start');
        this.context.lineWidth = this.Get('chart.linewidth');

        // Draw the background
        this.DrawBackground();

        // And lastly, draw the labels
        this.DrawLabels();

        // Draw the needle
        this.DrawNeedle();
        
        
        /**
        * Setup the context menu if required
        */
        if (this.Get('chart.contextmenu')) {
            RGraph.ShowContext(this);
        }
        
        /**
        * If the canvas is annotatable, do install the event handlers
        */
        if (this.Get('chart.annotatable')) {
            RGraph.Annotate(this);
        }
        
        /**
        * This bit shows the mini zoom window if requested
        */
        if (this.Get('chart.zoom.mode') == 'thumbnail' || this.Get('chart.zoom.mode') == 'area') {
            RGraph.ShowZoomWindow(this);
        }

        
        /**
        * This function enables resizing
        */
        if (this.Get('chart.resizable')) {
            RGraph.AllowResizing(this);
        }
    }

    /**
    * Draws the background
    */
    RGraph.Odometer.prototype.DrawBackground = function ()
    {
        this.context.beginPath();

        /**
        * Turn on the shadow if need be
        */
        if (this.Get('chart.shadow.outer')) {
            this.context.shadowColor   = '#666';
            this.context.shadowBlur    = 6;
            this.context.shadowOffsetX = 3;
            this.context.shadowOffsetY = 3;
        }

        var backgroundColor = '#eee';

        // Draw the grey border
        this.context.fillStyle = backgroundColor;
        this.context.arc(this.centerx, this.centery, this.radius, 0.0001, 6.28, false);
        this.context.fill();

        /**
        * Turn off the shadow
        */
        RGraph.NoShadow(this);


        // Draw a circle
        this.context.strokeStyle = '#666';
        this.context.arc(this.centerx, this.centery, this.radius, 0, 6.28, false);

        // Now draw a big white circle to make the lines appear as tick marks
        // This is solely for Chrome
        this.context.fillStyle = backgroundColor;
        this.context.arc(this.centerx, this.centery, this.radius, 0, 6.28, false);
        this.context.fill();

        /**
        * Draw more tickmarks
        */
        this.context.beginPath();
        this.context.strokeStyle = '#bbb';
        
        for (var i=0; i<=360; i+=3) {
            this.context.arc(this.centerx, this.centery, this.radius, 0, RGraph.degrees2Radians(i), false);
            this.context.lineTo(this.centerx, this.centery);
        }
        this.context.stroke();
        
        this.context.beginPath();
        this.context.strokeStyle = '#333';

        // Draw the tick marks
        for (var i=0; i<=360; i+=9) {
            this.context.arc(this.centerx, this.centery, this.radius, 0, RGraph.degrees2Radians(i), false);
            this.context.lineTo(this.centerx, this.centery);
        }


        this.context.stroke();

        this.context.beginPath();
        
        // Now draw a big white circle to make the lines appear as tick marks
        this.context.fillStyle = backgroundColor;
        this.context.strokeStyle = backgroundColor;
        this.context.arc(this.centerx, this.centery, this.radius - 5, 0, 6.28, false);
        this.context.fill();
        this.context.stroke();

        /**
        * Now draw the center bits shadow if need be
        */
        if (this.Get('chart.shadow.inner')) {
            this.context.beginPath();
            this.context.shadowColor   = 'black';
            this.context.shadowBlur    = 6;
            this.context.shadowOffsetX = 3;
            this.context.shadowOffsetY = 3;
            this.context.arc(this.centerx, this.centery, this.radius - this.Get('chart.label.area'), 0, 6.28, 0);
            this.context.fill();
            this.context.stroke();
    
            /**
            * Turn off the shadow
            */
            RGraph.NoShadow(this);
        }

        // Now draw the green area
        var greengrad = this.canvas.getContext('2d').createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 0, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2, this.canvas.width / 2);
        greengrad.addColorStop(0, 'white');
        greengrad.addColorStop(1, 'green');

        // Draw the "tick highlight"
        if (this.Get('chart.tickmarks.highlighted')) {
            this.context.beginPath();
            this.context.lineWidth = 5;
            this.context.strokeStyle = greengrad;
            this.context.arc(this.centerx, this.centery, this.radius - 2.5,
            
                -1.57,
                ((this.Get('chart.green.max') / this.Get('chart.end')) * 6.2830) - 1.57,
                0);

            this.context.stroke();
            
            this.context.lineWidth = 1;
        }

        this.context.beginPath();
            this.context.fillStyle = greengrad;
            this.context.arc(
                             this.centerx,
                             this.centery,
                             this.radius - this.Get('chart.label.area'),
                             -1.57,
                             ( (this.Get('chart.green.max') / this.Get('chart.end')) * 6.2830) - 1.57,
                             false
                            );
            this.context.lineTo(this.centerx, this.centery);
        this.context.closePath();
        this.context.fill();


        // Now draw the yellow area
        var yellowgrad = this.canvas.getContext('2d').createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 0, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2, this.canvas.width / 2);
        yellowgrad.addColorStop(0, 'white');
        yellowgrad.addColorStop(1, 'yellow');

        // Draw the "tick highlight"
        if (this.Get('chart.tickmarks.highlighted')) {
            this.context.beginPath();
            this.context.lineWidth = 5;
            this.context.strokeStyle = yellowgrad;
            this.context.arc(this.centerx, this.centery, this.radius - 2.5, (
            
                (this.Get('chart.green.max') / this.Get('chart.end')) * 6.2830) - 1.57,
                ((this.Get('chart.red.min') / this.Get('chart.end')) * 6.2830) - 1.57,
                0);

            this.context.stroke();
            
            this.context.lineWidth = 1;
        }

        this.context.beginPath();
            this.context.fillStyle = yellowgrad;
            this.context.arc(
                             this.centerx,
                             this.centery,
                             this.radius - this.Get('chart.label.area'),
                             ( (this.Get('chart.green.max') / this.Get('chart.end')) * 6.2830) - 1.57,
                             ( (this.Get('chart.red.min') / this.Get('chart.end')) * 6.2830) - 1.57,
                             false
                            );
            this.context.lineTo(this.centerx, this.centery);
        this.context.closePath();
        this.context.fill();

        
        // Now draw the red area if they're defined
        var redgrad = this.canvas.getContext('2d').createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 0, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2, this.canvas.width / 2);
        redgrad.addColorStop(0, 'white');
        redgrad.addColorStop(1, 'red');


        // Draw the "tick highlight"
        if (this.Get('chart.tickmarks.highlighted')) {
            this.context.beginPath();
            this.context.lineWidth = 5;
            this.context.strokeStyle = redgrad;
            this.context.arc(this.centerx, this.centery, this.radius - 2.5, ( (this.Get('chart.red.min') / this.Get('chart.end')) * 6.2830) - 1.57,(2 * Math.PI) - (0.5 * Math.PI),0);
            this.context.stroke();
            
            this.context.lineWidth = 1;
        }

        this.context.beginPath();
            this.context.fillStyle = redgrad;
            this.context.strokeStyle = redgrad;
            this.context.arc(
                             this.centerx,
                             this.centery,
                             this.radius - this.Get('chart.label.area'),
                             ( (this.Get('chart.red.min') / this.Get('chart.end')) * 6.2830) - 1.57,
                             6.2830 - (0.25 * 6.2830),
                             false
                            );
            this.context.lineTo(this.centerx, this.centery);
        this.context.closePath();
        this.context.fill();


        /**
        * Draw the thick border
        */
        if (this.Get('chart.border')) {
            var grad = this.context.createRadialGradient(this.centerx, this.centery, this.radius, this.centerx, this.centery, this.radius + 15);
            grad.addColorStop(1, '#bbb');
            grad.addColorStop(0.5, '#eee');
            grad.addColorStop(0, '#bbb');
            
            this.context.beginPath();
                this.context.fillStyle = grad;
                this.context.strokeStyle = grad;
                this.context.lineWidth = 17;
                this.context.arc(this.centerx, this.centery, this.radius + 7.5, 0, 2 * Math.PI, 0);
            this.context.stroke();
        }
        
        // Put the linewidth back to what it was
        this.context.lineWidth = this.Get('chart.linewidth');


        /**
        * Draw the title if specified
        */
        if (this.Get('chart.title')) {
            RGraph.DrawTitle(this.canvas, this.Get('chart.title'), this.Get('chart.gutter'), null, this.Get('chart.text.size') + 2);
        }
    }


    /**
    * Draws the needle of the odometer
    */
    RGraph.Odometer.prototype.DrawNeedle = function ()
    {
        this.context.fillStyle = '#666';
        this.context.strokeStyle = '#666';

        // Draw the centre bit
        this.context.beginPath();
            this.context.moveTo(this.centerx, this.centery);
            this.context.arc(this.centerx, this.centery, 10, 0, 6.28, false);
            this.context.fill();
        this.context.closePath();
        
        this.context.stroke();
        this.context.fill();

        if (this.Get('chart.needle.type') == 'pointer') {

            this.context.strokeStyle = this.Get('chart.needle.style');
            this.context.lineWidth   = this.Get('chart.needle.thickness');
            this.context.lineCap     = 'round';
            this.context.lineJoin    = 'round';
            
            // Draw the needle
            this.context.beginPath();
                // The trailing bit on the opposite side of the dial
                this.context.beginPath();
                    this.context.moveTo(this.centerx, this.centery);
                    
                    if (this.Get('chart.needle.tail')) {
                        this.context.arc(this.centerx,
                                         this.centery,
                                         20,
                                          (((this.Get('chart.value') / this.range) * 360) + 90) / 57.3,
                                         (((this.Get('chart.value') / this.range) * 360) + 90 + 1) / 57.3, // The 1 avoids a bug in ExCanvas
                                         false
                                        );
                    }
    
                // Draw the long bit on the opposite side
                this.context.arc(this.centerx,
                                 this.centery,
                                 this.radius - 15 - this.Get('chart.gutter'),
                                 (((this.Get('chart.value') / this.range) * 360) - 90) / 57.3,
                                 (((this.Get('chart.value') / this.range) * 360) - 90 + 1) / 57.3, // The 1 avoids a bug in ExCanvas
                                 false
                                );
            this.context.closePath();
            
            //this.context.stroke();
            //this.context.fill();

        } else if (this.Get('chart.needle.type') == 'triangle') {
        
            this.context.lineEnd  = 'square';
            this.context.lineJoin = 'miter';

            this.context.beginPath();
                this.context.strokeStyle = 'black';
                this.context.fillStyle = 'black';
                this.context.arc(this.centerx, this.centery, 5, (((this.Get('chart.value') / this.range) * 360)) / 57.3, (((this.Get('chart.value') / this.range) * 360)) / 57.3, 0);
                this.context.arc(this.centerx, this.centery, 5, (((this.Get('chart.value') / this.range) * 360) + 180) / 57.3, (((this.Get('chart.value') / this.range) * 360) + 180) / 57.3, 0);
                this.context.arc(this.centerx, this.centery, this.radius - this.Get('chart.label.area') - 10, (((this.Get('chart.value') / this.range) * 360) - 90) / 57.3, ((((this.Get('chart.value') / this.range) * 360) - 90) / 57.3) + 0.01, 0);
            this.context.closePath();
            this.context.stroke();
            this.context.fill();

            /**
            * This is here to accomodate the MSIE/ExCanvas combo
            */
            this.context.beginPath();
                this.context.arc(this.centerx, this.centery, 7, 0, 6.28, 0);
            this.context.closePath();
            this.context.fill();
        }
        
        this.context.stroke();
        this.context.fill();
        
        // Draw the mini center circle
        this.context.beginPath();
        this.context.fillStyle = 'black';
        this.context.arc(this.centerx, this.centery, 7, 0.01, 6.2830, false);
        this.context.fill();
        
        // This draws the arrow at the end of the line
        if (this.Get('chart.needle.head') && this.Get('chart.needle.type') == 'pointer') {
            this.context.fillStyle = this.Get('chart.needle.style');
            
            // round, bevel, miter
            this.context.lineJoin = 'miter';
            this.context.lineCap  = 'square';
    
            this.context.beginPath();
            this.context.arc(this.centerx,
                             this.centery,
                             this.radius - 15 - this.Get('chart.gutter') - 1,
                             (((this.Get('chart.value') / this.range) * 360) - 90) / 57.3,
                             (((this.Get('chart.value') / this.range) * 360) - 90 + 1) / 57.3, // The 1 avoids a bug in ExCanvas
                             false
                            );
                this.context.arc(this.centerx, this.centery, this.radius - this.Get('chart.label.area') - 15, RGraph.degrees2Radians( ((this.Get('chart.value') / this.range) * 360) - 87), RGraph.degrees2Radians( ((this.Get('chart.value') / this.range) * 360) - 93), 1);
            this.context.closePath();
    
            this.context.fill();
            this.context.stroke();
        }
    }
    
    /**
    * Draws the labels for the Odo
    */
    RGraph.Odometer.prototype.DrawLabels = function ()
    {
        var context = this.context;
        var size    = this.Get('chart.text.size');
        var font    = this.Get('chart.text.font');
        var centerx = this.centerx;
        var centery = this.centery;
        var r       = this.radius - (this.Get('chart.label.area') / 2);
        var end     = this.Get('chart.end');

        context.beginPath();
        context.fillStyle = this.Get('chart.text.color');

        // Should be able to determine the label angles
        RGraph.Text(context, font, size, centerx + (0.588 * r ), centery - (0.809 * r ), String(end * (1/10)), 'center', 'center', false, 36);
        RGraph.Text(context, font, size, centerx + (0.951 * r ), centery - (0.309 * r), String(end * (2/10)), 'center', 'center', false, 72);
        RGraph.Text(context, font, size, centerx + (0.949 * r), centery + (0.287 * r), String(end * (3/10)), 'center', 'center', false, 108);
        RGraph.Text(context, font, size, centerx + (0.588 * r ), centery + (0.809 * r ), String(end * (4/10)), 'center', 'center', false, 144);
        RGraph.Text(context, font, size, centerx, centery + r, String(end * (5/10)), 'center', 'center', false, 180);
        RGraph.Text(context, font, size, centerx - (0.588 * r ), centery + (0.809 * r ), String(end * (6/10)), 'center', 'center', false, 216);
        RGraph.Text(context, font, size, centerx - (0.949 * r), centery + (0.300 * r), String(end * (7/10)), 'center', 'center', false, 252);
        RGraph.Text(context, font, size, centerx - (0.951 * r), centery - (0.309 * r), String(end * (8/10)), 'center', 'center', false, 288);
        RGraph.Text(context, font, size, centerx - (0.588 * r ), centery - (0.809 * r ), String(end * (9/10)), 'center', 'center', false, 324);
        RGraph.Text(context, font, size, centerx, centery - r, String(end * (10/10)), 'center', 'center', false, 360);
        
        this.context.fill();
        this.context.stroke();
        
        /**
        * Draw the text label below the center point
        */
        if (this.Get('chart.value.text')) {
            context.strokeStyle = 'black';
            RGraph.Text(context, font, size + 2, centerx, centery + size + 2 + 10, String(this.Get('chart.units.pre') + this.Get('chart.value') + this.Get('chart.units.post')), 'center', 'center', true,  null, 'white');
        }
    }




