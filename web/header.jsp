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
<%--        <div class="search-box">--%>
<%--            <form class="clearfix">--%>
<%--                <input type="text" name="" class="search-input">--%>
<%--                <button class="search-submit"><img src="/img/search-icon.png" style="width: 100%;" alt=""></button>--%>
<%--            </form>--%>
<%--        </div>--%>
        <div class="login-register-box">
            <a class="loginregbtn" onclick="document.getElementById('id01').style.display='block'">Login</a> |
            <a class="loginregbtn" onclick="document.getElementById('id02').style.display='block'">Register</a>
<%--            <a>Admin</a>--%>
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
            <ul class="state-list"></ul>
        </div>
        <div class="navigation-history">
            <span>HISTORY</span>
            <ul class="history-list">
                <li class="poll"><a href="lastElection.jsp">Last Election Polls</a></li>
                <li class="poll"><a href="history.jsp">Past Election Polls</a></li>
            </ul>
        </div>
        <div class="hidden-navigation-box"></div>
    </div>
    <div id="id01" class="modal">
        <form class="modal-content animate" id="login-form" action="HeaderServlet?method=doLogin" method="post">
            <div class="imgcontainer">
                <span onclick="document.getElementById('id01').style.display='none';" class="close" title="Close">&times;</span>
<%--                <img src="img_avatar2.png" alt="Avatar" class="avatar">--%>
            </div>

            <div class="logincontainer">
                <p style="text-align:center;"><b>Login to cast your vote</b></p>

                <label for="unamel"><b>Username</b></label>
                <input type="text" placeholder="Enter Username" name="unamel" pattern="(?=.*).{8,}" title="Must contain at least 8 or more characters" class="userinput" required>

                <label for="pswl"><b>Password</b></label>
                <input type="password" placeholder="Enter Password" name="pswl" pattern="(?=.*).{8,}" title="Must contain at least 8 or more characters" class="userinput" required>

                <button type="submit" class="loginbtn">Login</button>
                <button type="button" onclick="document.getElementById('id01').style.display='none'" class="cancelbtn">Cancel</button>
            </div>
            <div class="logincontainer" style="background-color:#f1f1f1; margin-bottom:8px">
                <label>
                    <span class="cacc">Don't have an account? <a href="#" onclick="document.getElementById('id01').style.display='none'; document.getElementById('id02').style.display='block';">Register Here</a> </span>
                </label>
                <label>
                    <span class="psw"><a href="#">Forgot password?</a></span>
                </label>
            </div>
        </form>
    </div>
    <div id="id02" class="modal">
        <form class="modal-content animate" id="register-form" action="HeaderServlet?method=doRegister" method="post">
            <div class="imgcontainer">
                <span onclick="document.getElementById('id02').style.display='none'" class="close" title="Close">&times;</span>
<%--                <img src="img_avatar2.png" alt="Avatar" class="avatar">--%>
            </div>

            <div class="logincontainer">
                <p style="text-align:center;"><b>Registeration Form</b></p>

                <label for="unamer"><b>Username</b></label>
                <input type="text" placeholder="Enter Username" name="unamer" pattern="(?=.*).{8,}" title="Must contain at least 8 or more characters" class="userinput" required>

<%--                <label for="eaddress"><b>Email</b></label>--%>
<%--                <input type="text" placeholder="abcd@efgh.com" name="eaddress" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" title="Invalid email address" class="userinput" required>--%>

                <label for="pswr"><b>Password</b></label>
                <input type="password" placeholder="Enter Password" name="pswr" id="pswr" pattern="(?=.*).{8,}" title="Must contain at least 8 or more characters" class="userinput" required>

                <label for="cpswr"><b>Confirm Password</b></label>
                <input type="password" placeholder="Reenter Password" name="cpswr" id="cpswr" pattern="(?=.*).{8,}" title="Must contain at least 8 or more characters" class="userinput" required>

<%--                <label for="mnum"><b>Mobile Number</b></label>--%>
<%--                <input type="text" placeholder="xxx-xxx-xxxx" name="mnum" pattern="(?=.*\d)(?=.*).{10}" title="Invalid mobile number" class="userinput" required>--%>

<%--                <label for="city"><b>City</b></label>--%>
<%--                <input type="text" placeholder="Enter City" name="city" class="userinput" required>--%>

<%--                <label for="state"><b>State</b></label>--%>
<%--                <input type="text" placeholder="Enter State" name="state" class="userinput" required>--%>

<%--                <label for="zipcode"><b>Zipcode</b></label>--%>
<%--                <input type="text" placeholder="Enter zipcode" name="zcode" pattern="(?=.*\d)(?=.*).{5}" title="Must be 5 digits" title="Invalid zip code" class="userinput" required>--%>

                <button type="submit" class="registerbtn">Create Account</button>
                <button type="button" onclick="document.getElementById('id01').style.display='none'" class="cancelbtn">Cancel</button>
            </div>

            <div class="logincontainer" style="background-color:#f1f1f1; margin-bottom:8px">
                <label>
                    <span class="cacc">Already have an account? <a href="#" onclick="document.getElementById('id02').style.display='none'; document.getElementById('id01').style.display='block';">Login Here</a> </span>
                </label>
            </div>
        </form>
    </div>
</div>
