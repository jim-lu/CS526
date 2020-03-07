<%--
  Created by IntelliJ IDEA.
  User: Jim_Lu
  Date: 3/3/2020
  Time: 10:35 AM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html>
<head>
    <meta charset="utf-8">
    <title>Candidate</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- The styles -->
    <style><%@include file="WEB-INF/static/css/common.css"%></style>
    <style><%@include file="WEB-INF/static/css/candidate-info.css"%></style>

</head>

<body>

<div class="container">
    <div class="header">
        <div class="header-top clearfix">
            <div class="logo">
                <img src=""  alt=""/>
            </div>
            <div class="search-box">
                <form class="clearfix">
                    <input type="text" name="" class="search-input">
                    <button class="search-submit"><img src="/img/search-icon.png" style="width: 100%;" alt=""></button>
                </form>
            </div>
            <div class="login-register-box">
                <a>Login</a> |
                <a>Register</a>
            </div>
        </div>
        <div class="navigation-bar clearfix">
            <div class="navigation-poll">
                <span>POLL</span>
                <ul class="poll-list">
                    <!-- Notes: This part should be dynamically generated -->
                    <li class="poll">Democratic Primary Polls</li>
                    <li class="poll">Republican Primary Polls</li>
                    <li class="poll">General Election Polls</li>
                    <li class="poll"><a href="poll.jsp">Trump Job Approval</a></li>
                    <li class="poll">Direction of Country</li>
                    <!-- End notes -->
                </ul>
            </div>
            <div class="navigation-state">
                <span>STATE</span>
                <ul class="state-list">
                    <!-- Notes: This part should be dynamically generated -->
                    <li>Alabama</li>
                    <li>Alaska</li>
                    <li>Arizona</li>
                    <li>Arkansas</li>
                    <li>California</li>
                    <li>Colorado</li>
                    <li>Connecticut</li>
                    <li>Delaware</li>
                    <li>Florida</li>
                    <li>Georgia</li>
                    <li>Hawaii</li>
                    <li>Idaho</li>
                    <li>Illinois</li>
                    <li>Indiana</li>
                    <li><a href="state.jsp">Iowa</a></li>
                    <li>Kansas</li>
                    <li>Kentucky</li>
                    <li>Louisiana</li>
                    <li>Maine</li>
                    <li>Maryland</li>
                    <li>Massachusetts</li>
                    <li>Michigan</li>
                    <li>Minnesota</li>
                    <li>Mississippi</li>
                    <li>Missouri</li>
                    <li>Montana</li>
                    <li>Nebraska</li>
                    <li>Nevada</li>
                    <li>New Hampshire</li>
                    <li>New Jersey</li>
                    <li>New Mexico</li>
                    <li>New York</li>
                    <li>North Carolina</li>
                    <li>North Dakota</li>
                    <li>Ohio</li>
                    <li>Oklahoma</li>
                    <li>Oregon</li>
                    <li>Pennsylvania</li>
                    <li>Rhode Island</li>
                    <li>South Carolina</li>
                    <li>South Dakota</li>
                    <li>Tennessee</li>
                    <li>Texas</li>
                    <li>Vermont</li>
                    <li>Virginia</li>
                    <li>Washington</li>
                    <li>West Virginia</li>
                    <li>Wisconsin</li>
                    <li>Wyoming</li>
                    <!-- End notes -->
                </ul>
            </div>
            <div class="navigation-history">
                <span>HISTORY</span>
            </div>
            <div class="hidden-navigation-box"></div>
        </div>
    </div>
    <div class="main">
        <div class="candidate-container">
            <div class="left-container">
                <div class="img">
                    <img src="/img/biden.png" alt="">
                </div>
                <div class="name">JOE BIDEN</div>
                <div class="intro">
                    Biden is running on the legacy of the eight years he served alongside President Barack Obama and has proposed advancing that legacy on key issues like health care and the climate crisis. Prior to his time as vice president, Biden represented Delaware in the US Senate for 36 years.
                </div>
                <div class="education"><b>Education:</b>University of Delaware, B.A., 1965; Syracuse University Law School, J.D., 1968</div>
                <div class="born"><b>Born:</b>November 20, 1942</div>
            </div>
            <div class="right-container">
                <div class="plot-container">
                    <h2>Trend</h2>
                    <div>Here we should show a line chart of the percentage of poll this candidate got.</div>
                </div>
            </div>
        </div>

    </div>
    <div class="footer"></div>

    <!-- JS -->
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js"></script>
    <script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/raphael/2.1.0/raphael-min.js"></script>
    <script><%@include file="WEB-INF/static/js/jquery.usmap.js"%></script>
    <script><%@include file="WEB-INF/static/js/index.js"%></script>
</div>

</body>
</html>
