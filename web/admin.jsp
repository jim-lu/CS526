<%--
  Created by IntelliJ IDEA.
  User: Jim_Lu
  Date: 4/16/2020
  Time: 3:25 PM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <title>Index</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- The styles -->
    <style><%@include file="WEB-INF/static/css/common.css"%></style>
    <style><%@include file="WEB-INF/static/css/admin.css"%></style>

</head>
<body>

<div class="container">
    <jsp:include page="header.jsp" />
    <div class="main clearfix">
        <div class="left-container">
            <h2>Menu</h2>
            <ul class="menu">
                <li><a href="admin.jsp?tab=table">Tables</a></li>
                <li><a href="admin.jsp?tab=poll">Polls</a></li>
                <li><a href="admin.jsp?tab=user">Users</a></li>
            </ul>
        </div>
        <div class="right-container">
            <div class="list-container tables-tab">
                <h3>Table List</h3>
                <ul class="table-list clearfix"></ul>
            </div>
            <div class="list-container polls-tab">
                <h3>Site Poll List</h3>
                <ul class="site-poll-list"></ul>
                <div class="poll-form">
                    <h4>Add Poll</h4>
                    <p>Poll Name: </p>
                    <input class="text-box" id="poll-name" type="text" name="poll-name" />
                    <p>Label (Use ";" to separate): </p>
                    <input class="text-box" id="label" type="text" name="label" />
                    <p>Description</p>
                    <input class="text-box" id="description" type="text" name="description" />
                    <button class="submit-button" id="submit">Submit</button>
                </div>
            </div>
            <div class="list-container users-tab">
            </div>
        </div>
    </div>
    <jsp:include page="footer.jsp" />

    <!-- JS -->
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script type="text/javascript" src="https://d3js.org/d3.v3.min.js"></script>
    <script><%@include file="WEB-INF/static/js/common.js"%></script>
    <script><%@include file="WEB-INF/static/js/admin.js"%></script>
</div>

</body>
</html>
