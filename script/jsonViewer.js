var jvr = (function () {
    
    
    function createLine(key, value, margin) {
        var type = getType(value),
            mValue = getTypePresentation(value, type),
            valueClass = getValueClass(type),
            isComplex = isComplexType(type, value),
            title = type == typeFunction ? value.toString() : null;
        var lineDiv = createLineDiv(key, mValue, title, valueClass, isComplex, margin);
        lineDiv.tag = { key: key, value: value, margin: margin, isComplex: isComplex, isOpened: false };
        lineDiv.expandThis = expandThis.bind(lineDiv);
        lineDiv.collapseThis = collapseThis.bind(lineDiv);
        lineDiv.toggle = toggle.bind(lineDiv);
        lineDiv.toggleRecursive = toggleRecursive.bind(lineDiv);
        lineDiv.addEventListener('click', lineDiv.toggle);
        return lineDiv;
    }
    
    function toggle() {
        if (this.tag.isOpened) collapseRecursive(this, false);
        else expandRecursive(this, false);
        this.tag.isOpened = !this.tag.isOpened;
    }
    function toggleRecursive() {
        if (this.tag.isOpened) collapseRecursive(this, true);
        else expandRecursive(this, true);
        this.tag.isOpened = !this.tag.isOpened;
    }
    
    function expandRecursive(elem, changeChildState) {
        elem.expandThis();
        elem.tag.children.forEach(function(child){
            if (changeChildState) child.tag.isOpened = true;
            if (child.tag.isOpened) expandRecursive(child, changeChildState);
        });
    }
    
    function collapseRecursive(elem, changeChildState) {
        elem.collapseThis();
        if (elem.tag.children)
            elem.tag.children.forEach(function(child){
                if (changeChildState) child.tag.isOpened = false;
                collapseRecursive(child, changeChildState);
            });
    }
    
    
    function expandThis() {
        if (!this.tag.children) {
            this.tag.children = [];
            if (this.tag.isComplex) {
                var refElem = this;
                for (var key in this.tag.value) {
                    var lineDiv = createLine(key, this.tag.value[key], this.tag.margin + 1);
                    this.tag.children.push(lineDiv);
                    insertAfter(refElem, lineDiv);
                    refElem = lineDiv;
                }
            }
            return;
        }
        this.tag.children.forEach(function (childElem) {
            childElem.style.display = 'block';
        });
    }
    function collapseThis() {
        if (this.tag.children)
            this.tag.children.forEach(function (childElem) {
                childElem.style.display = 'none';
            });
    }
    function createLineDiv(key, value, title, valueClass, isComplex, margin) {
        var lineElem = document.createElement('div');
        var keyElem = document.createElement('span');
        var valElem = document.createElement('span');
        lineElem.appendChild(keyElem);
        lineElem.appendChild(valElem);
        lineElem.className = '_jvrLine' + (isComplex ? ' _comp' : '');
        lineElem.style.marginLeft = getMarginStyle(margin);
        keyElem.className = '_jvrKey';
        valElem.className = '_jvrVal ' + valueClass;
        keyElem.innerHTML = s(key) + ':';
        valElem.innerHTML = s(value);
        if (title) valElem.title = title;
        return lineElem;
    }
    function isComplexType(type, value) {
        return (type == typeArray || type == typeObject) && hasValues(value);
    }
    function createContainer() {
        var container = document.createElement('div');
        container.className = '_jvrCont';
        return container;
    }
    function getMarginStyle(margin) {
        return (margin * 30).toString() + 'px';
    }
    function insertAfter(refElem, newElem) {
        if (refElem.nextSibling) refElem.parentNode.insertBefore(newElem, refElem.nextSibling);
        else refElem.parentNode.appendChild(newElem);
    }
    function s(obj) {
        if (!obj) return obj;
        var str = (obj + '').replace(/</gi, '&lt;');
        str = str.replace(/>/gi, '&gt;');
        return str
    }
    function getTypePresentation(obj, type) {
        if (!obj) return obj;
        switch (type) {
            case typeArray: return hasValues(obj) ? '[...]' : '[]';
            case typeObject: return hasValues(obj) ? '{...}' : '{}';
            case typeFunction: return 'function';
            case typeString: 
            case typeNumber: 
            default: return obj;
        }
    }
    function hasValues(obj) {
        for (var key in obj) return true;
        return false;
    }
    function getType(obj) {
        if (!obj) return typeString;
        if (typeof obj == typeFunction) return typeFunction;
        if (typeof obj == typeObject) {
            if (obj.constructor == Array) return typeArray;
            return typeObject;
        }
        if (typeof obj == typeNumber) return typeNumber;
        return typeString;
    }
    function getValueClass(type) {
        switch (type) {
            case typeArray: return '_arr';
            case typeObject: return '_obj';
            case typeFunction: return '_fn';
            case typeString: return '_str';
            case typeNumber: return '_num';
        }
    }
    var typeString = 'string',
        typeNumber = 'number',
        typeObject = 'object',
        typeFunction = 'function',
        typeArray = 'array';
    
    
    return function (key, value) {
        var container = createContainer();
        var lineElem = createLine(key, value, 0);
        container.appendChild(lineElem);
        container.expand = function() {
            lineElem.tag.isOpened = this.isOpened = true;
            expandRecursive(lineElem, true);
        };
        container.collapse = function() {
            lineElem.tag.isOpened = this.isOpened = false;
            collapseRecursive(lineElem, true);
        };
        container.toggle = function() {
            this.isOpened ? this.collapse() : this.expand();
        }
        return container;
    }


}());