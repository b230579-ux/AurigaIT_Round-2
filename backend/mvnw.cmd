@REM Maven Wrapper startup batch script
@REM Adapted from https://github.com/apache/maven-wrapper

@IF "%__MVNW_ARG0__%"=="" SET __MVNW_ARG0__=%~dpnx0
@SET __MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_PSMODULEP_SAVE=%PSModulePath%
@SET PSModulePath=

@FOR /F "usebackq tokens=1* delims==" %%A IN ("%~dp0.mvn\wrapper\maven-wrapper.properties") DO @(
    @IF "%%A"=="distributionUrl" SET "MVNW_DIST_URL=%%B"
)

@IF "%MVNW_DIST_URL%"=="" (
    @SET __MVNW_ERROR__=distributionUrl not found
    @GOTO :error
)

@SET "MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists"
@SET "MVNW_DIST_DIR=%MAVEN_HOME%"

@REM Check if maven is already downloaded
@FOR /D %%D IN ("%MVNW_DIST_DIR%\apache-maven-*") DO @(
    @IF EXIST "%%D\bin\mvn.cmd" (
        @SET "MAVEN_HOME=%%D"
        @GOTO :exec
    )
)

@REM Download and extract
@ECHO Downloading Maven from %MVNW_DIST_URL%...
@SET "MVNW_ZIP=%TEMP%\maven-dist.zip"

@powershell -Command "Invoke-WebRequest -Uri '%MVNW_DIST_URL%' -OutFile '%MVNW_ZIP%' -UseBasicParsing"
@IF %ERRORLEVEL% NEQ 0 (
    @SET __MVNW_ERROR__=Failed to download Maven
    @GOTO :error
)

@powershell -Command "Expand-Archive -Path '%MVNW_ZIP%' -DestinationPath '%MVNW_DIST_DIR%' -Force"
@IF %ERRORLEVEL% NEQ 0 (
    @SET __MVNW_ERROR__=Failed to extract Maven
    @GOTO :error
)

@DEL "%MVNW_ZIP%" 2>NUL

@FOR /D %%D IN ("%MVNW_DIST_DIR%\apache-maven-*") DO @(
    @IF EXIST "%%D\bin\mvn.cmd" (
        @SET "MAVEN_HOME=%%D"
        @GOTO :exec
    )
)

@SET __MVNW_ERROR__=Maven not found after extraction
@GOTO :error

:exec
@SET PSModulePath=%__MVNW_PSMODULEP_SAVE%
@SET "PATH=%MAVEN_HOME%\bin;%PATH%"
@"%MAVEN_HOME%\bin\mvn.cmd" %*
@SET MVNW_EXIT=%ERRORLEVEL%
@GOTO :eof

:error
@ECHO [ERROR] %__MVNW_ERROR__%
@SET PSModulePath=%__MVNW_PSMODULEP_SAVE%
@EXIT /B 1
