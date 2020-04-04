<%--
  Created by IntelliJ IDEA.
  User: Jim_Lu
  Date: 3/8/2020
  Time: 11:57 PM
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<div class="header">
    <div class="header-top clearfix">
        <div class="logo">
            <a href="index.jsp"><img src="/img/logo.png"  alt=""/></a>
        </div>
        <div class="search-box">
            <form class="clearfix">
                <input type="text" name="" class="search-input">
                <button class="search-submit"><img src="/img/search-icon.png" style="width: 100%;" alt=""></button>
            </form>
        </div>
        <div class="login-register-box">
            <a>Login</a> |
            <a>Register</a> |
            <a>Admin</a>
        </div>
    </div>
    <div class="navigation-bar clearfix">
        <div class="navigation-poll">
            <span>POLL</span>
            <ul class="poll-list">
                <li class="poll"><a href="poll.jsp?poll=trumpJobApproval">Trump Job Approval</a></li>
                <li class="poll"><a href="poll.jsp?poll=congressionalJobApproval">Congressional Job Approval</a></li>
                <li class="poll"><a href="poll.jsp?poll=directionOfCountry">Direction of Country</a></li>
                <li class="poll"><a href="poll.jsp?poll=presidentImpeachment">President Impeachment</a></li>
            </ul>
        </div>
        <div class="navigation-nomination">
            <span>NOMINATION</span>
            <ul class="nomination-list">
                <li class="poll"><a href="nomination.jsp?poll=democraticNomination">Democratic Primary Polls</a></li>
                <li class="poll"><a href="nomination.jsp?poll=publicanNomination">Republican Primary Polls</a></li>
            </ul>
        </div>
        <div class="navigation-state">
            <span>STATE</span>
            <ul class="state-list">

            </ul>
        </div>
        <div class="navigation-history">
            <span>HISTORY</span>
        </div>
        <div class="hidden-navigation-box"></div>
    </div>
</div>
